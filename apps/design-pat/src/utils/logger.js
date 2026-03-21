import chalk from 'chalk';

/**
 * Simple colored console logger for CLI output
 */
export const logger = {
  info: (msg) => console.log(chalk.blue('ℹ'), msg),
  success: (msg) => console.log(chalk.green('✓'), msg),
  warn: (msg) => console.log(chalk.yellow('⚠'), msg),
  error: (msg) => console.error(chalk.red('✗'), msg),
  step: (msg) => console.log(chalk.cyan('→'), msg),
  dim: (msg) => console.log(chalk.dim(msg)),
  title: (msg) => console.log(chalk.bold.white(msg)),
};
