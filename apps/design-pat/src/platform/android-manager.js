import { execSync, spawn } from 'child_process';
import { createWriteStream } from 'fs';
import path from 'path';

/**
 * Manages Android emulator setup, app installation, and cleanup
 */
export default class AndroidManager {
  constructor(options = {}) {
    this.adbPath = options.adbPath || 'adb';
    this.emulatorPath = options.emulatorPath || 'emulator';
    this.avdName = options.avdName || 'pixel';
    this.deviceId = null;
    this.packageName = null;
  }

  /**
   * Start Android emulator or detect connected device
   */
  async startEmulator() {
    try {
      // Check for already running emulator or connected device
      const devices = execSync(`${this.adbPath} devices`).toString();
      const lines = devices.split('\n').filter((l) => l.trim() && !l.includes('List of'));

      for (const line of lines) {
        const [deviceId, status] = line.split(/\s+/);
        if (status === 'device') {
          this.deviceId = deviceId;
          console.log(`✓ Found device: ${deviceId}`);
          return deviceId;
        }
      }

      // If no device found, start emulator
      console.log(`Starting emulator '${this.avdName}'...`);
      spawn(this.emulatorPath, ['-avd', this.avdName, '-no-window'], {
        detached: true,
        stdio: 'ignore',
      }).unref();

      // Wait for emulator to boot
      for (let i = 0; i < 120; i++) {
        try {
          const bootStatus = execSync(`${this.adbPath} shell getprop sys.boot_completed`).toString().trim();
          if (bootStatus === '1') {
            const devices = execSync(`${this.adbPath} devices`).toString();
            const match = devices.match(/emulator-(\d+)\s+device/);
            if (match) {
              this.deviceId = match[0].split(/\s+/)[0];
              console.log(`✓ Emulator booted: ${this.deviceId}`);
              return this.deviceId;
            }
          }
        } catch (err) {
          // Still booting
        }
        await new Promise((r) => setTimeout(r, 1000));
      }

      throw new Error('Emulator failed to boot within 120 seconds');
    } catch (err) {
      throw new Error(`Android emulator setup failed: ${err.message}`);
    }
  }

  /**
   * Install APK on device
   */
  async installApp(apkPath) {
    if (!this.deviceId) {
      throw new Error('No device available. Call startEmulator() first.');
    }

    try {
      console.log(`Installing app from ${apkPath}...`);
      execSync(`${this.adbPath} -s ${this.deviceId} install -r "${apkPath}"`);

      // Extract package name from APK
      this.packageName = await this.extractPackageName(apkPath);
      console.log(`✓ App installed: ${this.packageName}`);
      return this.packageName;
    } catch (err) {
      throw new Error(`Failed to install APK: ${err.message}`);
    }
  }

  /**
   * Extract package name from APK manifest
   */
  async extractPackageName(apkPath) {
    try {
      // Use aapt (Android Asset Packaging Tool) if available
      const output = execSync(`aapt dump badging "${apkPath}"`).toString();
      const match = output.match(/package: name='([^']+)'/);
      return match ? match[1] : 'com.example.app';
    } catch {
      // Fallback: use filename
      const name = path.basename(apkPath, '.apk');
      return `com.${name.toLowerCase()}`;
    }
  }

  /**
   * Launch app on device
   */
  async launchApp(packageName) {
    if (!this.deviceId) {
      throw new Error('No device available.');
    }

    if (!packageName) {
      packageName = this.packageName;
    }

    try {
      console.log(`Launching ${packageName}...`);
      // Get the main activity
      const mainActivity = await this.getMainActivity(packageName);
      execSync(`${this.adbPath} -s ${this.deviceId} shell am start -n ${packageName}/${mainActivity}`);

      // Wait for app to be ready
      await new Promise((r) => setTimeout(r, 3000));
      console.log(`✓ App launched`);
    } catch (err) {
      throw new Error(`Failed to launch app: ${err.message}`);
    }
  }

  /**
   * Get main activity from package
   */
  async getMainActivity(packageName) {
    try {
      const output = execSync(`${this.adbPath} -s ${this.deviceId} shell cmd package resolve-activity --brief ${packageName}`).toString();
      const match = output.match(/^(.+)$/m);
      return match ? match[1].trim() : '.MainActivity';
    } catch {
      return '.MainActivity';
    }
  }

  /**
   * Uninstall app from device
   */
  async uninstallApp(packageName) {
    if (!this.deviceId) return;

    try {
      if (!packageName) {
        packageName = this.packageName;
      }
      if (!packageName) return;

      console.log(`Uninstalling ${packageName}...`);
      execSync(`${this.adbPath} -s ${this.deviceId} uninstall ${packageName}`);
      console.log(`✓ App uninstalled`);
    } catch (err) {
      console.warn(`Failed to uninstall app: ${err.message}`);
    }
  }

  /**
   * Cleanup: turn off emulator or disconnect
   */
  async cleanup() {
    try {
      if (!this.deviceId) return;

      // Uninstall app if installed
      if (this.packageName) {
        await this.uninstallApp(this.packageName);
      }

      // Kill emulator
      if (this.deviceId.includes('emulator')) {
        console.log('Shutting down emulator...');
        execSync(`${this.adbPath} -s ${this.deviceId} emu kill`);
        await new Promise((r) => setTimeout(r, 2000));
      }
    } catch (err) {
      console.warn(`Cleanup error: ${err.message}`);
    }
  }
}
