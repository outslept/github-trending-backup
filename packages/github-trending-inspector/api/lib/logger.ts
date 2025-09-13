export type LogLevel = 'info' | 'warn' | 'error';

export function makeLog(request: Request) {
  const ctx = {
    id: Math.random().toString(36).slice(2, 9),
    method: request.method,
    path: new URL(request.url).pathname,
    at: new Date().toISOString(),
    start: Date.now(),
  };

  const write = (level: LogLevel, message: string, extra?: Record<string, unknown>) => {
    const payload = {
      id: ctx.id,
      method: ctx.method,
      path: ctx.path,
      at: ctx.at,
      level,
      message,
      ...(extra ?? {}),
    };

    if (level === 'error') {
      console.error(JSON.stringify(payload));
    } else if (level === 'warn') {
      console.warn(JSON.stringify(payload));
    } else {
      console.log(JSON.stringify(payload));
    }
  };

  return {
    info: (message: string, data?: Record<string, unknown>) =>
      write('info', message, data ? { data } : undefined),
    warn: (message: string, data?: Record<string, unknown>) =>
      write('warn', message, data ? { data } : undefined),
    error: (message: string, err?: unknown, data?: Record<string, unknown>) =>
      write('error', message, {
        error:
          (err as { stack?: unknown })?.stack?.toString() ??
          (err as { message?: unknown })?.message?.toString() ??
          (err != null ? String(err) : undefined),
        ...(data ? { data } : {}),
      }),
    done: (status: number, data?: Record<string, unknown>) =>
      write('info', 'done', { status, duration: Date.now() - ctx.start, ...(data ? { data } : {}) }),
  };
}