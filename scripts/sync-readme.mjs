import { readFileSync, writeFileSync } from 'node:fs';

const [sourcePath, targetPath] = process.argv.slice(2);
if (!sourcePath || !targetPath) {
  console.error('Usage: node scripts/sync-readme.mjs <README.md> <getting-started.md>');
  process.exit(2);
}

const readme = readFileSync(sourcePath, 'utf8').replace(/\r\n?/g, '\n').trim();
if (readme.length < 1000 || !readme.includes('SJF4J') || !readme.includes('## Installation')) {
  throw new Error('Upstream README is missing expected content; refusing to overwrite the page.');
}

// Relative documentation links belong to the upstream repository, not this website.
const body = readme
  // Relative docs links refer to the upstream GitHub repository, not to website pages.
  .replace(
    /\]\(((?:\.\/)?docs\/[^\s)]+)\)/g,
    (_match, path) => '](https://github.com/sjf4j-projects/sjf4j/blob/main/' +
      path.replace(/^\.\//, '') + ')',
  )
  // An absolute link to this website is an internal VitePress link after import.
  .replace(
    /\]\(https:\/\/(?:www\.)?sjf4j\.org((?:\/|[?#])[^\s)]*)?\)/g,
    (_match, location = '') => {
      const path = location.startsWith('/') ? location : '/' + location;
      const canonical = path
        .replace(/^\/docs\/jdbc_mapping(?=\/|[?#]|$)/, '/docs/jdbc-mapping')
        .replace(/^\/docs\/getting_started(?=\/|[?#]|$)/, '/docs/getting-started');
      return '](' + canonical + ')';
    },
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
