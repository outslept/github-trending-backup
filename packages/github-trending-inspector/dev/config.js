export const PORT = 3001
export const CORS_ORIGIN = 'http://localhost:3000'
export const REPO_OWNER = 'outslept'
export const REPO_NAME = 'github-trending-backup'
export const REPO_BRANCH = 'master'
export const DATA_SUBPATH = 'packages/github-trending-data'
export const RAW_METADATA_URL = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${REPO_BRANCH}/${DATA_SUBPATH}/metadata.json`
export const GITHUB_CONTENTS_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_SUBPATH}`
export const DEBUG = process.env.DEBUG === '2'

export const DATE_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2}$/
export const MONTH_FORMAT_REGEX = /^\d{4}-\d{2}$/

export const corsHeaders = {
  'Access-Control-Allow-Origin': CORS_ORIGIN,
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json',
}
