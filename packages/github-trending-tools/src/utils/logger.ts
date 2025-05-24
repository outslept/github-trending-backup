import process from 'node:process'

const colors = {
  reset: '\x1B[0m',
  red: '\x1B[31m',
  green: '\x1B[32m',
  yellow: '\x1B[33m',
  blue: '\x1B[34m',
  magenta: '\x1B[35m',
  cyan: '\x1B[36m',
  gray: '\x1B[90m',
} as const

const symbols = {
  info: 'ℹ',
  success: '✔',
  warn: '⚠',
  error: '✖',
  start: '◐',
} as const

function formatMessage(level: string, symbol: string, color: string, message: string, ...args: unknown[]): string {
  const timestamp = new Date().toISOString().slice(11, 19)
  const tag = 'github-trending-tools'
  const formattedArgs = args.length > 0
    ? ` ${args.map(arg =>
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg),
    ).join(' ')}`
    : ''

  return `${colors.gray}${timestamp}${colors.reset} ${color}${symbol} ${tag}${colors.reset} ${message}${formattedArgs}\n`
}

function writeToStdout(message: string): void {
  process.stdout.write(message)
}

function writeToStderr(message: string): void {
  process.stderr.write(message)
}

export const logger = {
  info(message: string, ...args: unknown[]): void {
    const formatted = formatMessage('info', symbols.info, colors.blue, message, ...args)
    writeToStdout(formatted)
  },

  success(message: string, ...args: unknown[]): void {
    const formatted = formatMessage('success', symbols.success, colors.green, message, ...args)
    writeToStdout(formatted)
  },

  warn(message: string, ...args: unknown[]): void {
    const formatted = formatMessage('warn', symbols.warn, colors.yellow, message, ...args)
    writeToStderr(formatted)
  },

  error(message: string, ...args: unknown[]): void {
    const formatted = formatMessage('error', symbols.error, colors.red, message, ...args)
    writeToStderr(formatted)
  },

  start(message: string, ...args: unknown[]): void {
    const formatted = formatMessage('start', symbols.start, colors.cyan, message, ...args)
    writeToStdout(formatted)
  },
} as const
