import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    const today = new Date().toISOString().split('T')[0];
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw redirect({
      to: '/$date',
      params: { date: today },
    });
  },
});
