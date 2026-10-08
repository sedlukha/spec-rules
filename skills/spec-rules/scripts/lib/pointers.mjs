// Code points at the vault with the vault path in backticks, an arrow and a
// name. The README shows a full example. This file holds none, because this
// walk would read it as a pointer.
//
// A renamed heading kills such a pointer, and nothing else notices. The name
// must be a heading, a bold statement, a table rule, a note or a decision.

import { readFileSync } from "node:fs"
import { basename, dirname, join } from "node:path"
import { exists, walk } from "./files.mjs"
import { blankCode, plainName } from "./text.mjs"

const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

/**
 * Every name the vault answers to, and the notes that answer to it. A head is
 * the start of a long name, up to a colon, a comma or a dash. Code may name a
 * long heading by its head alone.
 */
const indexNames = (config, notes) => {
  const names = new Map()
  const heads = new Map()
  const add = (name, file) => {
    if (!name) {
      return
    }
    names.set(name, (names.get(name) ?? new Set()).add(file))
    for (const cut of name.matchAll(/,?\s[—–]\s|[:,]\s/g)) {
      const head = name.slice(0, cut.index)
      heads.set(head, (heads.get(head) ?? new Set()).add(file))
    }
  }

  for (const note of notes) {
    // A note answers to its file name, and a folder names every note inside it.
    const name = basename(note.file, ".md")
    add(
      name.startsWith(config.index) ? name.slice(config.index.length) : name,
      note.file
    )
    add(basename(dirname(note.file)), note.file)
    const text = blankCode(note.text)
    for (const match of text.matchAll(/^#{1,6}\s+(.+?)\s*$/gm)) {
      const heading = plainName(match[1])
      add(heading, note.file)
      // A note title reads «Screen: part», and code names the part alone.
      add(heading.replace(/^[^:]+:\s+/, ""), note.file)
    }
    // A line of a check list is named by its id, such as `CHK-a1b2`.
    for (const match of text.matchAll(/`([A-Z]{2,6}-[a-z0-9]+)`/g)) {
      add(match[1], note.file)
    }
    for (const match of text.matchAll(/\*\*(.+?)\*\*/gs)) {
      add(plainName(match[1]), note.file)
    }
    // A rule of a table stands in the first cell of its row.
    for (const match of text.matchAll(/^\|\s*([^|\n]+?)\s*\|/gm)) {
      add(plainName(match[1]), note.file)
    }
    // The vault names a note by the words of every link to it.
    for (const match of text.matchAll(
      /\[([^\]]+)\]\(([^)#]+\.md)(?:#[^)]*)?\)/g
    )) {
      const target = join(dirname(note.file), decodeURIComponent(match[2]))
      if (target.startsWith(`${join(config.vault)}/`)) {
        add(plainName(match[1]), target)
      }
    }
  }
  return { heads: [...heads], names: [...names] }
}

/**
 * What may follow a whole name: the end, a mark, or the English sentence going
 * on. A name of the vault never starts a word with a small Latin letter.
 */
const AFTER_NAME = /^(?:$|[.;!?)»]|[,:]?\s+[a-z]|\s[—–]\s+[a-z])/

/**
 * A comment wraps over lines. The markers at the start of each line are not
 * words, so the pointer is read with them taken out.
 */
const joinLines = (text) =>
  text.replace(/\s*\n\s*(?:\/\/|\*(?!\/)|\{\/\*)?\s*/g, " ")

export const checkPointers = (config, notes, decisions, report) => {
  const { decisionWords, files, marker, roots, skip } = config.pointers
  const { heads, names } = indexNames(config, notes)

  /** A decision is named by its number. */
  const decision = new RegExp(
    `^(?:${decisionWords.map(escape).join("|")})-?\\s*0*(\\d+)(?=$|[.;)]|[,:]?\\s+[a-z])`,
    "i"
  )

  /**
   * The notes a part names, when it starts with a whole name. Inside a chain
   * the name must live in the notes the step before named, or beside them.
   */
  const notesNamedBy = (part, within) => {
    const found = new Set()
    for (const [name, named] of [...names, ...heads]) {
      if (!(part.startsWith(name) && AFTER_NAME.test(part.slice(name.length)))) {
        continue
      }
      for (const file of named) {
        if (!within || within.has(dirname(file))) {
          found.add(file)
        }
      }
    }
    return found
  }

  /** A chain `A → B` holds when each step names a place inside the one before. */
  const resolves = (chain) => {
    let within = null
    for (const part of chain.split(/\s+→\s+/)) {
      const number = part.match(decision)?.[1]
      if (number) {
        if (!decisions.has(number)) {
          return false
        }
        within = new Set(decisions.get(number).map((file) => dirname(file)))
        continue
      }
      const found = notesNamedBy(part, within)
      if (found.size === 0) {
        return false
      }
      within = new Set([...found].map((file) => dirname(file)))
    }
    return true
  }

  /**
   * The pointer runs to a full stop, a bracket, a quote or a comment end. A
   * comma may sit inside a name, so a comma does not end it.
   */
  const pointer = new RegExp(
    `${escape(marker)}\\s*→\\s*(.+?)(?=\\.(?:\\s|$)|;|\\)|"|\`|\\s\\*\\/|\\s\\*\\}|$)`,
    "g"
  )

  const skipped = new Set(skip)
  let count = 0
  const codeFiles = roots
    .filter((root) => exists(root))
    .flatMap((root) => walk(root, skipped))
  for (const file of codeFiles) {
    if (!files.test(file)) {
      continue
    }
    for (const match of joinLines(readFileSync(file, "utf8")).matchAll(
      pointer
    )) {
      count += 1
      // A comma at the very end leads to a quote the pointer does not hold.
      const named = match[1].trim().replace(/,$/, "")
      // «A and B» names two places. A capital after «and» starts the second.
      if (!named.split(/,?\s+and\s+(?=\p{Lu})/u).every(resolves)) {
        report.fail(
          "pointers",
          file,
          `${marker} → «${named}» names nothing in the spec`
        )
      }
    }
  }
  return count
}
