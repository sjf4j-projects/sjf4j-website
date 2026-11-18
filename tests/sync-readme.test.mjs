import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const script = fileURLToPath(new URL('../scripts/sync-readme.mjs', import.meta.url));

function generate(readme) {
  const directory = mkdtempSync(join(tmpdir(), 'sjf4j-readme-'));
  try {
    const source = join(directory, 'README.md');
    const target = join(directory, 'getting-started.md');
    writeFileSync(source, readme);
    execFileSync(process.execPath, [script, source, target], { stdio: 'pipe' });
    return readFileSync(target, 'utf8');
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test('sync converts website URLs to local links and preserves external links', () => {
  const readme = [
    '# SJF4J',
    '## Installation',
    'Context for import. '.repeat(85),
    '[Binding](https://sjf4j.org/docs/binding)',
    '[JDBC](https://sjf4j.org/docs/jdbc-mapping)',
    '[JDBC anchor](https://sjf4j.org/docs/jdbc-mapping#columns)',
    '[Getting started](https://www.sjf4j.org/docs/getting-started?source=readme#setup)',
    '[Generator](https://sjf4j.org/generator)',
    '[Home](https://sjf4j.org/)',
    '[Home fragment](https://sjf4j.org#performance-at-a-glance)',
    '[Javadoc](https://javadoc.io/doc/org.sjf4j/sjf4j-core)',
    '[Source benchmark](docs/performance/binding.md)',
    '[Source benchmark 2](./docs/performance/schema.md)',
  ].join('\n');
  const output = generate(readme);
  assert.match(output, /\[Binding\]\(\/docs\/binding\)/);
  assert.match(output, /\[JDBC\]\(\/docs\/jdbc-mapping\)/);
  assert.match(output, /\[JDBC anchor\]\(\/docs\/jdbc-mapping#columns\)/);
  assert.match(output, /\[Getting started\]\(\/docs\/getting-started\?source=readme#setup\)/);
  assert.match(output, /\[Generator\]\(\/generator\)/);
  assert.match(output, /\[Home\]\(\/\)/);
  assert.match(output, /\[Home fragment\]\(\/#performance-at-a-glance\)/);
  assert.match(output, /\[Javadoc\]\(https:\/\/javadoc\.io\/doc\/org\.sjf4j\/sjf4j-core\)/);
  assert.match(output, /\[Source benchmark\]\(https:\/\/github\.com\/sjf4j-projects\/sjf4j\/blob\/main\/docs\/performance\/binding\.md\)/);
  assert.match(output, /\[Source benchmark 2\]\(https:\/\/github\.com\/sjf4j-projects\/sjf4j\/blob\/main\/docs\/performance\/schema\.md\)/);
  assert.doesNotMatch(output, /\]\(https:\/\/(?:www\.)?sjf4j\.org/);
});
