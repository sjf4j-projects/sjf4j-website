import { readFileSync, writeFileSync } from 'node:fs';

const [sourcePath, targetPath] = process.argv.slice(2);
if (!sourcePath || !targetPath) {
  console.error('Usage: node scripts/sync-readme.mjs <README.md> <getting_started.md>');
  process.exit(2);
}

const readme = readFileSync(sourcePath, 'utf8').replace(/\r\n?/g, '\n').trim();
if (readme.length < 1000 || !readme.includes('SJF4J') || !readme.includes('## Installation')) {
  throw new Error('Upstream README is missing expected content; refusing to overwrite the page.');
}

// Relative documentation links belong to the upstream repository, not this website.
const body = readme.replace(
  /\]\(((?:\.\/)?docs\/[^\s)]+)\)/g,
  (_match, path) => '](https://github.com/sjf4j-projects/sjf4j/blob/main/' +
    path.replace(/^\.\//, '') + ')',
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
