interface LogEntry {
  requestId: string;
  method: string;
  path: string;
  userAgent?: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  duration?: number;
  status?: number;
  error?: string;
  data?: Record<string, unknown>;
}

export class Logger {
  private context: Pick<
    LogEntry,
    'requestId' | 'method' | 'path' | 'userAgent' | 'timestamp'
  >;

  constructor(request: Request) {
    const userAgent = request.headers.get('user-agent');

    this.context = {
      requestId: Math.random().toString(36).substring(2, 15),
      method: request.method,
      path: new URL(request.url).pathname,
      userAgent:
        userAgent != null && userAgent.length > 0 ? userAgent : undefined,
      timestamp: new Date().toISOString(),
    };
  }

  private log(entry: Omit<LogEntry, keyof typeof this.context>): void {
    console.log(JSON.stringify({ ...this.context, ...entry }));
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.log({ level: 'info', message, data });
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.log({ level: 'warn', message, data });
  }

  error(message: string, error?: Error, data?: Record<string, unknown>): void {
    this.log({
      level: 'error',
      message,
      error: error?.stack ?? error?.message ?? undefined,
      data,
    });
  }

  request(): void {
    this.log({ level: 'info', message: 'Request started' });
  }

  response(
    startTime: number,
    status: number,
    data?: Record<string, unknown>,
  ): void {
    this.log({
      level: 'info',
      message: 'Request completed',
      duration: Date.now() - startTime,
      status,
      data,
    });
  }
}
