import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger.js';

/**
 * Generate JSON reports: per-screen detail + summary of all screens
 */
export async function generateReport(screen, results, config) {
  const { outputDir } = config;
  const reportDir = path.join(outputDir, 'reports');

  try {
    await fs.mkdir(reportDir, { recursive: true });

    // Per-screen report
    const screenReport = {
      screenId: screen.id,
      screenName: screen.name,
      timestamp: new Date().toISOString(),
      accuracy: results.accuracy,
      mismatchPixels: results.mismatchCount,
      totalPixels: results.totalPixels,
      passed: results.accuracy >= (screen.ciThreshold ?? config.ciThreshold ?? 95),
      ciThreshold: screen.ciThreshold ?? config.ciThreshold ?? 95,
      files: {
        figma: `/figma/${screen.id}.png`,
        screenshot: `/screenshots/${screen.id}.png`,
        diff: `/diffs/${screen.id}-diff.png`,
        annotated: `/annotated/${screen.id}-annotated.png`,
      },
      regions: (results.regions || []).map((region, idx) => ({
        id: idx,
        bounds: {
          x: region.x,
          y: region.y,
          width: region.width,
          height: region.height,
        },
        pixelCount: region.pixelCount,
        elements: region.elements || [],
        issues: region.issues || [],
      })),
      allIssues: (results.regions || []).flatMap((r) => r.issues || []),
    };

    const screenReportPath = path.join(reportDir, `${screen.id}.json`);
    await fs.writeFile(screenReportPath, JSON.stringify(screenReport, null, 2));
    logger.success(`Saved per-screen report → ${screenReportPath}`);

    return screenReport;
  } catch (error) {
    logger.error(`Failed to generate report for ${screen.id}: ${error.message}`);
    throw error;
  }
}

/**
 * Generate summary report across all screens
 */
export async function generateSummary(allReports, config) {
  const { outputDir } = config;
  const reportDir = path.join(outputDir, 'reports');

  try {
    const totalScreens = allReports.length;
    const passed = allReports.filter((r) => r.passed).length;
    const failed = totalScreens - passed;
    const overallAccuracy =
      allReports.reduce((sum, r) => sum + r.accuracy, 0) / totalScreens;

    const summary = {
      timestamp: new Date().toISOString(),
      totalScreens,
      passed,
      failed,
      overallAccuracy: Math.round(overallAccuracy * 100) / 100,
      screens: allReports.map((r) => ({
        id: r.screenId,
        name: r.screenName,
        accuracy: Math.round(r.accuracy * 100) / 100,
        passed: r.passed,
        issueCount: r.allIssues.length,
      })),
    };

    const summaryPath = path.join(reportDir, 'summary.json');
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
    logger.success(`Saved summary report → ${summaryPath}`);

    return summary;
  } catch (error) {
    logger.error(`Failed to generate summary: ${error.message}`);
    throw error;
  }
}
