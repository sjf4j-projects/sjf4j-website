import { readFileSync, writeFileSync } from 'node:fs';

const [sourcePath, targetPath] = process.argv.slice(2);
if (!sourcePath || !targetPath) {
  console.error('Usage: node scripts/sync-readme.mjs <README.md> <getting-started.md>');
  process.exit(2);
}

const readme = readFileSync(sourcePath, 'utf8').replace(/\r\n?/g, '\n').trim();
if (readme.length < 1000 || !readme.includes('SJF4J') || !readme.includes('## Quickstart')) {
  throw new Error('Upstream README is missing expected content; refusing to overwrite the page.');
}

// Convert links to this website into VitePress internal navigation.
const body = readme.replace(
    /\]\(https:\/\/(?:www\.)?sjf4j\.org((?:\/|[?#])[^\s)]*)?\)/g,
    (_match, location = '') => '](' +
      (location.startsWith('/') ? location : '/' + location) + ')',
  );

const output = [
  '---',
  'title: "Getting Started"',
  'description: "Introduction to SJF4J and its capabilities."',
  '---',
  '',
  '# Getting Started',
  '',
  body,
  '',
].join('\n');

writeFileSync(targetPath, output, 'utf8');
