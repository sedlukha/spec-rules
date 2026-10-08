// Reading the vault from disk. Only `node:` modules here: a CI step may run the
// check before anything is installed.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { basename, dirname, join, relative } from "node:path"

/** Every file under a folder. A skipped name is never opened. */
export const walk = (dir, skip = new Set()) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (skip.has(entry.name)) {
      return []
    }
    const path = join(dir, entry.name)
    return entry.isDirectory() ? walk(path, skip) : [path]
  })

/** Every Markdown file under a folder, or nothing when the folder is missing. */
export const markdownFiles = (dir) =>
  existsSync(dir) ? walk(dir).filter((file) => file.endsWith(".md")) : []

export const exists = (path) => {
  try {
    statSync(path)
    return true
  } catch {
    return false
  }
}

/** The header block, or null when the note has none. */
export const readHeader = (text) => {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  return match ? match[1] : null
}

/** The note without its header block. */
export const stripHeader = (text) => text.replace(/^---\r?\n[\s\S]*?\r?\n---/, "")

/** One field of a header block, or null. */
export const field = (header, name) => {
  const match = header.match(new RegExp(`^${name}:\\s*(.+)$`, "m"))
  return match ? match[1].trim() : null
}

/** A relative Markdown link: `](./x.md)` or `](../x.md#part)`. */
const RELATIVE_LINK = /\]\((\.[^)#]*?)(?:#[^)]*)?\)/g

/** Every relative link of a text, as written. */
export const relativeLinks = (text) =>
  [...text.matchAll(RELATIVE_LINK)].map((match) => match[1])

/** Where a relative link of a file points on disk. */
export const linkTarget = (file, target) =>
  join(dirname(file), decodeURIComponent(target))

/** A note, read once and shared by every check. */
export const readNote = (file, root) => {
  const text = readFileSync(file, "utf8")
  const header = readHeader(text)
  return {
    body: stripHeader(text),
    file,
    header,
    name: basename(file),
    relative: relative(root, file).split("\\").join("/"),
    text,
  }
}
