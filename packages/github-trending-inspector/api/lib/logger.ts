interface LogEntry {
  requestId: string;
  method: string;
  path: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  duration?: number;
  status?: number;
  error?: string;
  data?: Record<string, unknown>;
}

export class Logger {
  private context: {
    requestId: string;
    method: string;
    path: string;
    timestamp: string;
  };

  constructor(request: Request) {
    this.context = {
      requestId: Math.random().toString(36).slice(2, 9),
      method: request.method,
      path: new URL(request.url).pathname,
      timestamp: new Date().toISOString(),
    };

    this.info('Request started');
  }

  private log(level: LogEntry['level'], message: string, extra: Partial<LogEntry> = {}): void {
    console.log(JSON.stringify({
      ...this.context,
      level,
      message,
      ...extra
    }));
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.log('info', message, { data });
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.log('warn', message, { data });
  }

  error(message: string, error?: Error, data?: Record<string, unknown>): void {
    this.log('error', message, {
      error: error?.stack || error?.message,
      data
    });
  }

  response(startTime: number, status: number, data?: Record<string, unknown>): void {
    this.log('info', 'Request completed', {
      duration: Date.now() - startTime,
      status,
      data,
    });
  }
}
