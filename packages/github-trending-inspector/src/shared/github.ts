export const REPO_OWNER = 'outslept'
export const REPO_NAME = 'github-trending-backup'
export const BRANCH = 'master'
export const DATA_SUBPATH = 'packages/github-trending-data'

export const GITHUB_CONTENTS_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_SUBPATH}`
export const METADATA_URL = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${DATA_SUBPATH}/metadata.json`
