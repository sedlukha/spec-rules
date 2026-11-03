// Two signals. Each asks for a small cut during normal work, so the vault never
// needs a big cleanup later. A signal is a warning: the run still passes.
//
// A decision that no code names may hold a rule the code never follows. A
// note over its budget holds more than one subject, or a copy of another note.

import { readFileSync } from "node:fs"
import { dirname } from "node:path"
import { isOn } from "./config.mjs"
import { codeFiles, joinLines, slugMentions } from "./pointers.mjs"
import { decisionId } from "./vault-rules.mjs"

/**
 * Slug mode only. Each decision of `decisions.unnamedInCode.layers` must be
 * named by a code file, or stand in `allow`. A dead `allow` entry fails.
 */
const checkUnnamedInCode = (config, notes, decisions, report) => {
  const { allow, layers } = config.decisions.unnamedInCode
  const { files, roots, skip } = config.pointers
  const named = new Set()
  for (const file of codeFiles(roots, skip, files)) {
    // A comment may wrap between the word and the slug.
    const text = joinLines(readFileSync(file, "utf8"))
    for (const { slugs } of slugMentions(config, text)) {
      for (const slug of slugs) {
        named.add(slug)
      }
    }
  }

  const inLayers = new Map()
  for (const note of notes) {
    const id = decisionId(config, note)
    if (id && (!layers || layers.includes(note.relative.split("/")[0]))) {
      inLayers.set(id, note.file)
    }
  }

  const allowed = new Set(allow)
  for (const [slug, file] of inLayers) {
    if (!(named.has(slug) || allowed.has(slug))) {
      report.warn(
        "decision-in-code",
        file,
        `no code file names decision ${slug}`
      )
    }
  }
  // An entry that excuses nothing reads as a decision and holds none.
  for (const slug of allow) {
    if (!decisions.has(slug)) {
      report.failAll(
        "decision-in-code",
        `decisions.unnamedInCode.allow names ${slug}, and no decision note has it`
      )
    } else if (!inLayers.has(slug)) {
      report.failAll(
        "decision-in-code",
        `decisions.unnamedInCode.allow names ${slug}, a decision outside its layers`
      )
    } else if (named.has(slug)) {
      report.failAll(
        "decision-in-code",
        `decisions.unnamedInCode.allow names ${slug}, and code names it already`
      )
    }
  }
}

/** The lines of a text. The newline at the end opens no line. */
const lineCount = (text) => text.replace(/\n$/, "").split("\n").length

/**
 * A note over the budget of its kind. Index notes, registers and rule notes
 * are lists by nature, so they are not measured.
 */
const checkBudgets = (config, notes, report) => {
  const { decision, folders } = config.budgets
  const registers = new Set([
    ...(config.openQuestions?.registers ?? []),
    ...(config.future?.exempt ?? []),
  ])
  for (const note of notes) {
    if (
      note.name.startsWith(config.index) ||
      registers.has(note.name) ||
      note.relative === config.decisions.retired ||
      config.ruleNotes.includes(note.name)
    ) {
      continue
    }
    const folder = dirname(note.relative)
      .split("/")
      .find((part) => part in folders)
    const budget =
      decisionId(config, note) === null
        ? (folders[folder] ?? null)
        : (decision ?? folders[folder] ?? null)
    const lines = lineCount(note.text)
    if (budget !== null && lines > budget) {
      report.warn("budgets", note.file, `${lines} lines, budget ${budget}`)
    }
  }
}

export const checkSignals = (config, notes, decisions, report) => {
  if (
    isOn(config, "decision-in-code") &&
    config.decisions.id === "slug" &&
    config.decisions.unnamedInCode &&
    config.pointers
  ) {
    checkUnnamedInCode(config, notes, decisions, report)
  }
  if (isOn(config, "budgets") && config.budgets) {
    checkBudgets(config, notes, report)
  }
}
