import { GITHUB_CONTENTS_BASE, METADATA_URL } from '../src/shared/github'

export const PORT = 3001
export const CORS_ORIGIN = 'http://localhost:3000'
export const DEBUG = process.env.DEBUG === '2'

export const RAW_METADATA_URL = METADATA_URL
export { GITHUB_CONTENTS_BASE }

export const DATE_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2}$/
export const MONTH_FORMAT_REGEX = /^\d{4}-\d{2}$/

export const corsHeaders = {
  'Access-Control-Allow-Origin': CORS_ORIGIN,
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json',
}
