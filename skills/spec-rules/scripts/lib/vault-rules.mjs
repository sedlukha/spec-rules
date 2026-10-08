// The rules that read the notes of the vault. Each rule has an id, and the
// config can turn it off: `rules: { "retired": false }`.

import { basename, dirname, join } from "node:path"
import { isOn } from "./config.mjs"
import {
  exists,
  field,
  linkTarget,
  markdownFiles,
  readNote,
  relativeLinks,
} from "./files.mjs"
import { blankCode, lineOf } from "./text.mjs"

/** A decision note: `ADR-024 Title.md` or `adr-024-title.md`. */
export const DECISION_FILE = /^adr-0*(\d+)/i

/** Read the vault once. Every rule works on this. */
export const readVault = (config) => {
  const isTemplate = (note) =>
    note.relative.split("/").some((part) => config.templates.includes(part))
  const notes = markdownFiles(config.vault)
    .map((file) => readNote(file, config.vault))
    .filter((note) => !isTemplate(note))
  const frozen = config.frozen.flatMap((dir) =>
    markdownFiles(join(config.vault, dir)).map((file) =>
      readNote(file, config.vault)
    )
  )
  return { frozen, notes }
}

const isRuleNote = (config, note) => config.ruleNotes.includes(note.name)

/** 2. Every relative link resolves. This one breaks the most often. */
const checkLinks = (note, fail) => {
  for (const target of relativeLinks(note.text)) {
    if (!exists(linkTarget(note.file, target))) {
      fail("links", note.file, `link points at nothing: ${target}`)
    }
  }
}

/**
 * Every name a wikilink may use: the short name of a note, and its path from
 * the vault root. Obsidian also takes the end of a path, so each tail counts.
 */
const noteNames = (vault) => {
  const names = new Set()
  for (const note of [...vault.notes, ...vault.frozen]) {
    const parts = note.relative.replace(/\.md$/, "").split("/")
    for (let start = 0; start < parts.length; start += 1) {
      names.add(parts.slice(start).join("/"))
    }
  }
  return names
}

/** A wikilink to a file that is not a note, such as a picture. */
const NOT_A_NOTE = /\.(?!md$)[a-z0-9]+$/i

/**
 * One link style in the whole vault. A link to a decision by its bare number
 * tells the reader nothing, in either style.
 */
const checkLinkStyle = (config, note, names, fail) => {
  const text = blankCode(note.body, /[[\]]/g)
  // The header is not in the body, so its lines are added back for the report.
  const head = note.text.slice(0, note.text.length - note.body.length)
  const wikilinks = [...text.matchAll(/\[\[([^\]\n]+)\]\]/g)]
  if (config.links === "markdown") {
    for (const match of wikilinks) {
      const line = lineOf(head + text, head.length + match.index)
      fail(
        "link-style",
        note.file,
        `a wikilink in a vault of Markdown links: ${match[0]}, line ${line}`
      )
    }
  } else {
    for (const match of wikilinks) {
      const target = match[1].split(/[|#]/)[0].trim().replace(/\.md$/, "")
      // A path from the note itself, or a name, or the end of a path.
      const found =
        !target ||
        NOT_A_NOTE.test(target) ||
        exists(join(dirname(note.file), `${target}.md`)) ||
        names.has(target.replace(/^(\.\.?\/)+/, ""))
      if (!found) {
        fail("links", note.file, `link points at nothing: ${match[0]}`)
      }
    }
    for (const target of relativeLinks(text)) {
      fail(
        "link-style",
        note.file,
        `a Markdown link in a vault of wikilinks: ${target}`
      )
    }
  }
  const bare = [
    ...relativeLinks(text).map((target) => basename(target, ".md")),
    ...wikilinks.map((match) => match[1].split(/[|#]/)[0].trim()),
  ].filter((target) => /^adr-?\d+$/i.test(target))
  for (const target of bare) {
    fail(
      "link-style",
      note.file,
      `a link names a decision by its number alone: ${target}`
    )
  }
}

/** 3, 4, 10. The header: a closed list of values, and a short summary. */
const checkHeader = (config, note, fail) => {
  const { header } = note
  if (header === null) {
    fail("header", note.file, "note has no header block")
    return
  }
  const status = field(header, "status")
  for (const gone of config.goneFields) {
    if (field(header, gone) !== null) {
      fail(
        "header",
        note.file,
        `the header holds \`${gone}\`, a field the vault dropped`
      )
    }
  }
  if (!(status && config.statuses.includes(status))) {
    fail("header", note.file, `status is not from the list: ${status}`)
  }
  const decisionStatus = field(header, "decision_status")
  if (decisionStatus && !config.decisionStatuses.includes(decisionStatus)) {
    fail(
      "header",
      note.file,
      `decision_status is not from the list: ${decisionStatus}`
    )
  }

  // A reader picks a note by these lines: `grep -r "^summary:"` is the map.
  const summary = field(header, "summary")?.replace(/^"|"$/g, "")
  if (isOn(config, "summary")) {
    if (!summary) {
      fail("summary", note.file, "note has no summary line in the header")
    } else if (summary.split(/\s+/).length > config.summaryWords) {
      fail(
        "summary",
        note.file,
        `summary is longer than ${config.summaryWords} words`
      )
    }
  }
  if (isOn(config, "summary-forbidden")) {
    const line = field(header, "summary")
    for (const entry of config.summaryForbidden) {
      const hit = line?.match(entry.pattern)
      if (hit) {
        fail("summary-forbidden", note.file, `${entry.message}: "${hit[0]}"`)
      }
    }
  }
}

/**
 * 5. A question lives only in the register. Another note holds a pointer, or
 * says it has none. What it must never hold is the question itself.
 */
const checkOpenQuestions = (config, note, fail) => {
  const rule = config.openQuestions
  if (rule.registers.includes(note.name)) {
    return
  }
  const heading = rule.heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const section = note.text.match(
    new RegExp(`\\n## ${heading}\\n([\\s\\S]*?)(?=\\n## |$)`)
  )
  if (!section) {
    return
  }
  const body = section[1]
  const pointsAtRegister = body.includes("](") || body.includes("[[")
  const saysNone = rule.none ? rule.none.test(body) : false
  if (!(pointsAtRegister || saysNone)) {
    fail(
      "open-questions",
      note.file,
      "the open questions section neither links nor says it has none"
    )
  }
}

/**
 * 11. A retired thing is named only beside a link that says it is gone. The
 * header block is skipped: a field value never becomes a link.
 */
const checkRetired = (config, note, fail) => {
  const paragraphs = note.body.split(/\n[ \t]*\n/)
  for (const retired of config.retired) {
    if (retired.homes.includes(note.relative)) {
      continue
    }
    for (const paragraph of paragraphs) {
      const hit = paragraph.match(retired.pattern)
      if (!hit) {
        continue
      }
      const explained = retired.homes.some((home) => {
        const name = basename(home)
        return (
          paragraph.includes(name.replace(/ /g, "%20")) ||
          paragraph.includes(`[[${basename(name, ".md")}`)
        )
      })
      if (!explained) {
        fail(
          "retired",
          note.file,
          `names ${retired.thing}, which a decision took away: "${hit[0]}". Say it is gone and link one of: ${retired.homes.join(", ")}`
        )
      }
    }
  }
}

/** The checks that read one live note at a time. */
const checkNote = (config, note, names, fail) => {
  // 1. An empty note reads as decided, and that is a lie.
  if (note.text.trim().length === 0) {
    if (isOn(config, "empty-note")) {
      fail("empty-note", note.file, "note is empty")
    }
    return
  }
  // The rule notes show the link format by example, so they hold no real path.
  if (isRuleNote(config, note)) {
    return
  }
  if (isOn(config, "links") && config.links === "markdown") {
    checkLinks(note, fail)
  }
  if (isOn(config, "link-style") || config.links === "wikilink") {
    checkLinkStyle(config, note, names, (rule, ...rest) => {
      if (isOn(config, rule)) {
        fail(rule, ...rest)
      }
    })
  }
  if (isOn(config, "header")) {
    checkHeader(config, note, fail)
  }
  if (isOn(config, "open-questions") && config.openQuestions) {
    checkOpenQuestions(config, note, fail)
  }
  if (isOn(config, "forbidden-heading")) {
    for (const entry of config.forbiddenHeadings) {
      const hit = note.text.match(entry.pattern)
      if (hit) {
        fail("forbidden-heading", note.file, `${entry.message}: ${hit[0].trim()}`)
      }
    }
  }
  if (isOn(config, "retired")) {
    checkRetired(config, note, fail)
  }
}

/** 13. Every note lives in the folder of one layer, and each has one owner. */
const checkLayers = (config, notes, fail) => {
  const layers = new Set(config.layers)
  for (const note of notes) {
    const [top, ...rest] = note.relative.split("/")
    if (rest.length === 0 ? !config.rootNotes.includes(top) : !layers.has(top)) {
      fail(
        "layers",
        note.file,
        `a note lives outside the layers: ${config.layers.join(", ")}`
      )
    }
  }
}

/** 7. One index per folder, named with the index prefix. */
const checkIndex = (config, notes, failAll) => {
  const folders = new Map()
  for (const note of notes) {
    const folder = dirname(note.file)
    folders.set(folder, [...(folders.get(folder) ?? []), note.name])
  }
  for (const [folder, names] of folders) {
    const indexes = names.filter((name) => name.startsWith(config.index))
    if (indexes.length > 1) {
      failAll("index", `${folder}: folder holds ${indexes.length} index notes`)
    }
    if (indexes.length === 0 && config.requireIndex) {
      failAll(
        "index",
        `${folder}: folder has no index note named "${config.index}…"`
      )
    }
  }
}

/** Every decision number, and the notes that carry it. */
export const decisionNumbers = (notes) => {
  const decisions = new Map()
  for (const note of notes) {
    const number = note.name.match(DECISION_FILE)?.[1]
    if (number) {
      decisions.set(number, [...(decisions.get(number) ?? []), note.file])
    }
  }
  return decisions
}

/** 8. A decision number names one note. A repeat splits one decision in two. */
const checkDecisionNumbers = (decisions, failAll) => {
  for (const [number, files] of decisions) {
    if (files.length > 1) {
      failAll(
        "decision-number",
        `decision number ${number.padStart(3, "0")} is on ${files.length} notes: ${files.join(", ")}`
      )
    }
  }
}

/**
 * 6. A deferred idea names its trigger and links a live note. A split idea
 * answers once, through its folder index: a trigger copied into every part is
 * the same defect as a copied number.
 */
const checkFuture = (config, notes, fail) => {
  const root = join(config.vault, config.future.dir)
  const live = `${join(config.vault)}/`
  for (const note of notes) {
    if (!note.file.startsWith(`${root}/`) || isRuleNote(config, note)) {
      continue
    }
    const inRoot = dirname(note.file) === root
    const isIndex = note.name.startsWith(config.index)
    const answers = inRoot ? !isIndex : isIndex
    if (!answers || config.future.exempt.includes(note.name)) {
      continue
    }
    if (!config.future.trigger.some((marker) => note.text.includes(marker))) {
      fail("future", note.file, "a future note names no trigger")
    }
    const reachesLive = relativeLinks(note.text).some((target) => {
      const path = linkTarget(note.file, target)
      return path.startsWith(live) && !path.startsWith(`${root}/`)
    })
    if (!reachesLive) {
      fail("future", note.file, "a future note links to nothing in the vault")
    }
  }
}

/** Run every rule over the notes of the vault. */
export const checkVault = (config, vault, report) => {
  const { fail, failAll } = report
  const names = noteNames(vault)
  for (const note of vault.notes) {
    checkNote(config, note, names, fail)
  }
  if (isOn(config, "layers") && config.layers) {
    checkLayers(config, vault.notes, fail)
  }
  // Beside the vault two rules hold: links resolve, and a deferred idea names
  // its trigger. Every other rule is for a live note, and these are frozen.
  for (const note of vault.frozen) {
    if (isOn(config, "links") && !isRuleNote(config, note)) {
      checkLinks(note, fail)
    }
  }
  if (isOn(config, "future") && config.future) {
    checkFuture(config, [...vault.notes, ...vault.frozen], fail)
  }
  if (isOn(config, "index")) {
    checkIndex(config, vault.notes, failAll)
  }
  const decisions = decisionNumbers(vault.notes)
  if (isOn(config, "decision-number")) {
    checkDecisionNumbers(decisions, failAll)
  }
  return { decisions }
}
