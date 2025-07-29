import { readdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { styleText } from 'node:util';

function log(level, message, ...args) {
  const timestamp = new Date().toISOString().slice(11, 23);
  const styledTimestamp = styleText('gray', timestamp);

  const levelColors = {
    info: 'blue',
    ok: 'green',
    warn: 'yellow',
    error: 'red',
  };

  const styledLevel = styleText(
    levelColors[level] || 'reset',
    level.toUpperCase().padEnd(4),
  );
  console.log(`${styledTimestamp} ${styledLevel} ${message}`, ...args);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '../data');

try {
  const startTime = Date.now();
  log('info', 'Scanning data directory...');

  const years = {};

  for (const yearName of await readdir(dataDir)) {
    if (!/^\d{4}$/.test(yearName)) continue;

    years[yearName] = {};

    for (const monthName of await readdir(join(dataDir, yearName))) {
      if (!/^\d{2}$/.test(monthName)) continue;

      const files = await readdir(join(dataDir, yearName, monthName));
      const days = files
        .filter((file) => file.endsWith('.md'))
        .map((file) => file.replace('.md', '').split('-')[2])
        .sort();

      if (days.length > 0) {
        years[yearName][monthName] = days;
      }
    }

    if (Object.keys(years[yearName]).length === 0) {
      delete years[yearName];
    }
  }

  const metadata = {
    lastUpdated: new Date().toISOString(),
    years,
  };

  await writeFile(
    join(dataDir, 'metadata.json'),
    JSON.stringify(metadata, null, 2),
  );

  const duration = Date.now() - startTime;
  log('ok', `Generated metadata ${styleText('gray', `${duration}ms`)}`);
} catch (error) {
  log('error', `Failed to generate metadata: ${error.message}`);
  process.exit(1);
}
