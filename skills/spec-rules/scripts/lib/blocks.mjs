// The shape of the text inside a note: tables, lists, and the generated
// decision index. Git merges a list with a blank line between items better
// than a table. Two branches that edit two rows side by side conflict in a
// table. In such a list they merge clean. So a busy vault keeps lists, keeps
// some of them in order, and builds its decision index from the notes.
//
// `check-spec.mjs` reads these rules. `fix-spec.mjs` rewrites the notes.

import { basename, dirname } from "node:path"
import { field } from "./files.mjs"
import { plainName } from "./text.mjs"

/** A line of a table: it starts and ends with a pipe. */
const TABLE_ROW = /^\|.*\|\s*$/

/** The line under the table header: `| --- | :-: |`. */
const DIVIDER = /^\|(?:\s*:?-{3,}:?\s*\|)+\s*$/

/** The first line of a list item at the top level. */
const ITEM = /^[-*]\s+(.*)$/

/** The generated part of a decision index sits between these two lines. */
export const INDEX_START = "<!-- decision-index -->"
export const INDEX_END = "<!-- /decision-index -->"

/** For each line, whether it sits inside a code fence. */
const fenced = (lines) => {
  let open = null
  return lines.map((line) => {
    const mark = line.match(/^\s*(```|~~~)/)?.[1]
    if (mark && (open === null || open === mark)) {
      const inside = open !== null
      open = open === null ? mark : null
      return inside || open !== null
    }
    return open !== null
  })
}

/** The cells of one table row, trimmed. */
const cells = (row) =>
  row
    .trim()
    .slice(1, -1)
    .split("|")
    .map((cell) => cell.trim())

/**
 * Every table of a text: a header row, the divider, then the rows. The ends
 * are line indexes, and the end is not part of the table.
 */
export const findTables = (text) => {
  const lines = text.split("\n")
  const code = fenced(lines)
  const tables = []
  for (let i = 0; i < lines.length - 1; i += 1) {
    if (code[i] || !TABLE_ROW.test(lines[i]) || !DIVIDER.test(lines[i + 1])) {
      continue
    }
    let end = i + 2
    while (end < lines.length && !code[end] && TABLE_ROW.test(lines[end])) {
      end += 1
    }
    tables.push({ end, start: i })
    i = end - 1
  }
  return tables
}

/**
 * The head of a list item made from a row: the first cell in bold. A cell that
 * is already bold stays as it is. A cell with bold inside stays plain, because
 * two stars inside two stars break the bold.
 */
const head = (cell) => {
  if (/^\*\*[^*]+\*\*$/.test(cell) || cell.includes("**")) {
    return cell
  }
  return `**${cell}**`
}

/**
 * One table as a list. The first cell of a row is the head of its item. Every
 * other cell is a sub-item, named by its column. An empty cell is dropped.
 */
const tableToList = (rows) => {
  const names = cells(rows[0])
  return rows
    .slice(2)
    .map((row) => {
      const values = cells(row)
      const parts = names
        .map((name, index) => ({ name, value: values[index] ?? "" }))
        .filter((part) => part.value)
      if (parts.length === 0) {
        return null
      }
      // A row with an empty first cell takes its first full cell as the head.
      const [first, ...rest] =
        values[0] === ""
          ? [
              { value: `${parts[0].name}: ${parts[0].value}` },
              ...parts.slice(1),
            ]
          : parts
      const subItems = rest.map((part) =>
        part.name ? `  - ${part.name}: ${part.value}` : `  - ${part.value}`
      )
      return [`- ${head(first.value)}`, ...subItems].join("\n")
    })
    .filter(Boolean)
    .join("\n\n")
}

/**
 * The line that opens a list made from a table right under another table. Two
 * lists with only a blank line between them read as one list. The name of the
 * first column says what the new items are. With no name, a comment still
 * ends the first list.
 */
const leadLine = (header) => {
  const name = cells(header)[0].replace(/[.:]$/, "")
  return name ? `${name}:` : "<!-- -->"
}

/** The text with every table turned into a list. */
export const convertTables = (text) => {
  const tables = findTables(text)
  if (tables.length === 0) {
    return text
  }
  const lines = text.split("\n")
  const out = []
  let at = 0
  let listBefore = false
  for (const { end, start } of tables) {
    const between = lines.slice(at, start)
    out.push(...between)
    const list = tableToList(lines.slice(start, end))
    // A table with no rows leaves nothing, and no extra blank lines either.
    if (list === "") {
      while (out.length > 0 && out.at(-1).trim() === "") {
        out.pop()
      }
      if (end < lines.length && lines[end].trim() !== "") {
        out.push("")
      }
      at = end
      continue
    }
    // A list needs a blank line on each side, or it joins the text around it.
    if (out.length > 0 && out.at(-1).trim() !== "") {
      out.push("")
    }
    if (listBefore && between.every((line) => line.trim() === "")) {
      out.push(leadLine(lines[start]), "")
    }
    out.push(...list.split("\n"))
    if (end < lines.length && lines[end].trim() !== "") {
      out.push("")
    }
    listBefore = true
    at = end
  }
  out.push(...lines.slice(at))
  return out.join("\n")
}

/**
 * Every run of top-level list items. An item runs on through indented lines
 * and blank lines. A run ends at a line that is neither. The ends are line
 * indexes, and each item keeps its own lines with no blank line at the end.
 */
export const findLists = (text) => {
  const lines = text.split("\n")
  const code = fenced(lines)
  const runs = []
  let run = null
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]
    if (!code[i] && ITEM.test(line)) {
      run ??= { items: [] }
      run.items.push({ end: i + 1, start: i })
      continue
    }
    // A line right under an item, with no blank line between, belongs to it.
    // Markdown reads it that way too, though it is not indented.
    const lazy = lines[i - 1]?.trim() !== "" && !/^(#|\||```|~~~)/.test(line)
    // A fence at the start of a line ends the list. An indented one belongs
    // to the item, and so does every line inside it.
    const goesOn =
      run &&
      (code[i]
        ? /^\s/.test(line) || (code[i - 1] && !/^(```|~~~)/.test(line))
        : line.trim() === "" || /^\s+\S/.test(line) || lazy)
    if (goesOn) {
      if (line.trim() !== "") {
        run.items.at(-1).end = i + 1
      }
      continue
    }
    if (run) {
      runs.push(run)
      run = null
    }
  }
  if (run) {
    runs.push(run)
  }
  for (const found of runs) {
    for (const item of found.items) {
      item.text = lines.slice(item.start, item.end).join("\n")
      item.head = plainName(lines[item.start].match(ITEM)[1])
    }
  }
  return runs
}

/** The heads of every top-level item: the names a list gives its rows. */
export const itemHeads = (text) =>
  findLists(text).flatMap((run) => run.items.map((item) => item.head))

/** Compares two heads the way a reader of the vault's language sorts them. */
const byHead = (locale) => {
  const collator = new Intl.Collator(locale, { sensitivity: "base" })
  return (a, b) => collator.compare(a.head, b.head)
}

/** The first pair of items out of order in each list, for the report. */
export const unsortedPairs = (text, locale) => {
  const compare = byHead(locale)
  const pairs = []
  for (const run of findLists(text)) {
    for (let i = 1; i < run.items.length; i += 1) {
      if (compare(run.items[i - 1], run.items[i]) > 0) {
        pairs.push([run.items[i - 1].head, run.items[i].head])
        break
      }
    }
  }
  return pairs
}

/** The text with every list in order, and one blank line between items. */
export const sortLists = (text, locale) => {
  const compare = byHead(locale)
  const runs = findLists(text).filter((run) => run.items.length > 1)
  if (runs.length === 0) {
    return text
  }
  const lines = text.split("\n")
  const out = []
  let at = 0
  for (const run of runs) {
    const first = run.items[0].start
    const last = run.items.at(-1).end
    out.push(...lines.slice(at, first))
    const sorted = [...run.items].sort(compare)
    out.push(
      ...sorted
        .map((item) => item.text)
        .join("\n\n")
        .split("\n")
    )
    at = last
  }
  out.push(...lines.slice(at))
  return out.join("\n")
}

/** The title of a note: its first level-one heading. */
const title = (note) =>
  note.body.match(/^#\s+(.+?)\s*$/m)?.[1] ?? basename(note.name, ".md")

/** One line of the index for one decision note. */
const indexLine = (config, note) => {
  const summary = (field(note.header ?? "", "summary") ?? "")
    .replace(/^"|"$/g, "")
    .trim()
  const link =
    config.links === "wikilink"
      ? `[[${basename(note.name, ".md")}|${title(note)}]]`
      : `[${title(note)}](./${note.name.replace(/ /g, "%20")})`
  if (!summary) {
    return `- ${link}`
  }
  const end = /[.!?»"]$/.test(summary) ? "" : "."
  return `- ${link}. ${summary}${end}`
}

/**
 * The index of each folder that holds decision notes, and the generated block
 * it should hold. The lines go in the order of the file names. A new line then
 * lands in its own place, and two branches rarely add at the same spot.
 */
export const decisionIndexes = (config, notes, isDecision) => {
  const folders = new Map()
  for (const note of notes) {
    if (isDecision(note)) {
      const folder = dirname(note.file)
      folders.set(folder, [...(folders.get(folder) ?? []), note])
    }
  }
  return [...folders].map(([folder, decisions]) => {
    const index = notes.find(
      (note) =>
        dirname(note.file) === folder && note.name.startsWith(config.index)
    )
    const lines = decisions
      .sort((a, b) => (a.name < b.name ? -1 : 1))
      .map((note) => indexLine(config, note))
    const block = [INDEX_START, "", lines.join("\n\n"), "", INDEX_END].join(
      "\n"
    )
    return { block, folder, index }
  })
}

/** The generated block of an index note, or null when it has none. */
export const currentBlock = (text) => {
  const start = text.indexOf(INDEX_START)
  const end = text.indexOf(INDEX_END)
  if (start === -1 || end < start) {
    return null
  }
  return text.slice(start, end + INDEX_END.length)
}

/**
 * The text of an index note with a fresh block. A note with no block gets one
 * at the end.
 */
export const withBlock = (text, block) => {
  const found = currentBlock(text)
  if (found !== null) {
    return text.replace(found, () => block)
  }
  return `${text.replace(/\s*$/, "")}\n\n${block}\n`
}
