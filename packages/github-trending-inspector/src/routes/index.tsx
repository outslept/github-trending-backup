import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    const today = new Date().toISOString().split('T')[0];
    throw redirect({
      to: '/$date',
      params: { date: today },
    });
  },
});
