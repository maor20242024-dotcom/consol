/**
 * Logger Utility for Meta Webhooks and Debugging
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function colorize(text: string, color: keyof typeof colors): string {
  return `${colors[color]}${text}${colors.reset}`;
}

export function log(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const prefix = colorize(`[${timestamp}] [LOG]`, 'cyan');
  console.log(prefix, message);
  if (data) {
    console.log(colorize('Data:', 'yellow'), data);
  }
}

export function error(message: string, error?: any) {
  const timestamp = new Date().toISOString();
  const prefix = colorize(`[${timestamp}] [ERROR]`, 'red');
  console.error(prefix, message);
  if (error) {
    console.error(colorize('Error details:', 'yellow'), error);
  }
}

export function metaWebhook(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const prefix = colorize(`[${timestamp}] [WEBHOOK]`, 'green');
  console.log(prefix, message);
  if (data) {
    console.log(colorize('Webhook data:', 'yellow'), data);
  }
}

export function metaSent(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const prefix = colorize(`[${timestamp}] [META]`, 'blue');
  console.log(prefix, message);
  if (data) {
    console.log(colorize('Sent data:', 'yellow'), data);
  }
}

export function warn(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const prefix = colorize(`[${timestamp}] [WARN]`, 'yellow');
  console.warn(prefix, message);
  if (data) {
    console.warn(colorize('Warning data:', 'yellow'), data);
  }
}

export default {
  log,
  error,
  metaWebhook,
  metaSent,
  warn,
};
