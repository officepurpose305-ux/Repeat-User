import { execSync, spawn } from 'child_process';
import { platform } from 'os';
import { createReadStream } from 'fs';
import unzipper from 'unzipper';

/**
 * Manages iOS simulator setup, app installation, and cleanup
 * Note: macOS only
 */
export default class iOSManager {
  constructor(options = {}) {
    this.xcrunPath = options.xcrunPath || 'xcrun';
    this.simulatorName = options.simulatorName || 'iPhone 15';
    this.udid = null;
    this.bundleId = null;
  }

  /**
   * Check if running on macOS
   */
  checkPlatform() {
    if (platform() !== 'darwin') {
      throw new Error('iOS testing requires macOS. Use Android on Linux/Windows.');
    }
  }

  /**
   * Start iOS simulator
   */
  async startSimulator() {
    this.checkPlatform();

    try {
      // Find available iPhone simulator
      const deviceList = execSync(`${this.xcrunPath} simctl list devices available`).toString();
      const lines = deviceList.split('\n');

      let simulatorUdid = null;
      for (const line of lines) {
        if (line.includes(this.simulatorName)) {
          const match = line.match(/\(([A-F0-9-]+)\)/);
          if (match) {
            simulatorUdid = match[1];
            break;
          }
        }
      }

      if (!simulatorUdid) {
        throw new Error(`${this.simulatorName} simulator not found. Available simulators: ${deviceList}`);
      }

      this.udid = simulatorUdid;
      console.log(`✓ Found simulator: ${this.simulatorName} (${this.udid})`);

      // Check if already booted
      const bootedStatus = execSync(`${this.xcrunPath} simctl info ${this.udid}`).toString();
      if (bootedStatus.includes('Booted')) {
        console.log('✓ Simulator already running');
        return this.udid;
      }

      // Boot simulator
      console.log('Starting simulator...');
      execSync(`${this.xcrunPath} simctl boot ${this.udid}`);

      // Wait for boot to complete
      for (let i = 0; i < 60; i++) {
        try {
          const status = execSync(`${this.xcrunPath} simctl info ${this.udid}`).toString();
          if (status.includes('Booted')) {
            console.log('✓ Simulator booted');
            return this.udid;
          }
        } catch (err) {
          // Still booting
        }
        await new Promise((r) => setTimeout(r, 1000));
      }

      throw new Error('Simulator failed to boot within 60 seconds');
    } catch (err) {
      throw new Error(`iOS simulator setup failed: ${err.message}`);
    }
  }

  /**
   * Install IPA on simulator
   */
  async installApp(ipaPath) {
    if (!this.udid) {
      throw new Error('No simulator available. Call startSimulator() first.');
    }

    try {
      console.log(`Installing app from ${ipaPath}...`);

      // Extract bundle ID from IPA (it's a zip file)
      this.bundleId = await this.extractBundleId(ipaPath);
      console.log(`Bundle ID: ${this.bundleId}`);

      // Install app
      execSync(`${this.xcrunPath} simctl install ${this.udid} "${ipaPath}"`);
      console.log(`✓ App installed: ${this.bundleId}`);

      return this.bundleId;
    } catch (err) {
      throw new Error(`Failed to install IPA: ${err.message}`);
    }
  }

  /**
   * Extract bundle ID from IPA file
   */
  async extractBundleId(ipaPath) {
    return new Promise((resolve, reject) => {
      const readStream = createReadStream(ipaPath);

      readStream
        .pipe(unzipper.Parse())
        .on('entry', (entry) => {
          const fileName = entry.path;

          // Look for Info.plist in Payload/AppName.app/
          if (fileName.includes('Payload') && fileName.endsWith('Info.plist')) {
            let data = '';

            entry.on('data', (chunk) => {
              data += chunk.toString();
            });

            entry.on('end', () => {
              // Parse plist XML to extract CFBundleIdentifier
              const match = data.match(/<key>CFBundleIdentifier<\/key>\s*<string>([^<]+)<\/string>/);
              if (match) {
                resolve(match[1]);
              } else {
                resolve('com.example.app');
              }
            });
          } else {
            entry.autodrain();
          }
        })
        .on('error', reject);
    });
  }

  /**
   * Launch app on simulator
   */
  async launchApp(bundleId) {
    if (!this.udid) {
      throw new Error('No simulator available.');
    }

    if (!bundleId) {
      bundleId = this.bundleId;
    }

    try {
      console.log(`Launching ${bundleId}...`);
      execSync(`${this.xcrunPath} simctl launch ${this.udid} ${bundleId}`);

      // Wait for app to be ready
      await new Promise((r) => setTimeout(r, 3000));
      console.log(`✓ App launched`);
    } catch (err) {
      throw new Error(`Failed to launch app: ${err.message}`);
    }
  }

  /**
   * Uninstall app from simulator
   */
  async uninstallApp(bundleId) {
    if (!this.udid) return;

    try {
      if (!bundleId) {
        bundleId = this.bundleId;
      }
      if (!bundleId) return;

      console.log(`Uninstalling ${bundleId}...`);
      execSync(`${this.xcrunPath} simctl uninstall ${this.udid} ${bundleId}`);
      console.log(`✓ App uninstalled`);
    } catch (err) {
      console.warn(`Failed to uninstall app: ${err.message}`);
    }
  }

  /**
   * Cleanup: shutdown simulator
   */
  async cleanup() {
    try {
      if (!this.udid) return;

      // Uninstall app if installed
      if (this.bundleId) {
        await this.uninstallApp(this.bundleId);
      }

      // Shutdown simulator
      console.log('Shutting down simulator...');
      execSync(`${this.xcrunPath} simctl shutdown ${this.udid}`);
      await new Promise((r) => setTimeout(r, 2000));
    } catch (err) {
      console.warn(`Cleanup error: ${err.message}`);
    }
  }
}
