import { createFileRoute, redirect } from '@tanstack/react-router'
import { fetchLatestAvailableDate } from '../lib/trending-metadata'

export const Route = createFileRoute('/latest')({
  beforeLoad: async () => {
    throw redirect({
      to: '/$date',
      params: { date: await fetchLatestAvailableDate() },
    })
  },
})
