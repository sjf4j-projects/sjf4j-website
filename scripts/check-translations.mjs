import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Git blob ID of a file's UTF-8 bytes (same as git hash-object). */
export function gitBlobSha(contents) {
  const bytes = Buffer.from(contents, 'utf8')
  return createHash('sha1')
    .update(`blob ${bytes.length}\0`)
    .update(bytes)
    .digest('hex')
}

/**
 * Find translations that need review. A source change is informational: it
 * must never prevent upstream README updates from reaching the website.
 */
export function checkTranslationFreshness(root = process.cwd()) {
  const docsDir = resolve(root, 'zh/docs')
  if (!existsSync(docsDir)) return []

  const files = dir => readdirSync(dir, { withFileTypes: true })
    .flatMap(entry => {
      const path = join(dir, entry.name)
      return entry.isDirectory() ? files(path) : [path]
    })

  return files(docsDir)
    .filter(file => file.endsWith('.md'))
    .flatMap(file => {
      const chinese = readFileSync(file, 'utf8')
      const relativeFile = relative(root, file).replaceAll('\\', '/')
      const englishFile = resolve(root, relativeFile.replace(/^zh\//, ''))
      const frontmatter = chinese.match(/^---\s*\n([\s\S]*?)\n---/)
      const revision = frontmatter?.[1].match(/^translationSourceSha:\s*["']?([a-f0-9]{40})["']?\s*$/m)?.[1]

      if (!existsSync(englishFile)) {
        return [{ file: relativeFile, status: 'missing-source' }]
      }
      if (!revision) {
        return [{ file: relativeFile, status: 'untracked' }]
      }
      const current = gitBlobSha(readFileSync(englishFile, 'utf8'))
      return revision === current
        ? []
        : [{ file: relativeFile, status: 'outdated' }]
    })
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const findings = checkTranslationFreshness()
  for (const finding of findings) {
    const explanation = {
      'missing-source': 'The original English Markdown file is missing.',
      untracked: 'Add translationSourceSha with the English Git blob SHA.',
      outdated: 'English content has changed; review and update this translation, then refresh translationSourceSha.',
    }[finding.status]
    // GitHub Actions annotations; warning only, never a failing check.
    console.log(`::warning file=${finding.file},title=Translation review needed::${explanation}`)
  }
  if (findings.length === 0) {
    console.log('All tracked Chinese documentation translations are current.')
  }
}
