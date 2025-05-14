import type { Repository } from './types'

export function exportToJson(data: Repository[], filename: string) {
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export function exportToCsv(data: Repository[], filename: string) {
  const headers = ['rank', 'title', 'url', 'description', 'stars', 'todayStars', 'language']
  const csvRows = [
    headers.join(','),
    ...data.map(repo =>
      headers.map(header =>
        JSON.stringify((repo as any)[header] || ''),
      ).join(','),
    ),
  ]
  const csvString = csvRows.join('\n')
  const blob = new Blob([csvString], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
