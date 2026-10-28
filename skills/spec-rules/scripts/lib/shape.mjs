// The rules that keep a vault easy for git to merge: no tables, some lists in
// order, and a decision index built from the notes. Each rule here has a fix
// in `fix-spec.mjs`, so a conflict is solved by running the fix again.

import {
  convertTables,
  currentBlock,
  decisionIndexes,
  findTables,
  sortLists,
  unsortedPairs,
  withBlock,
} from "./blocks.mjs"
import { isOn } from "./config.mjs"
import { decisionId } from "./vault-rules.mjs"

const FIX = "Run fix-spec.mjs"

/** The notes that `sorted.notes` names, and a fail for each missing one. */
const sortedNotes = (config, notes, failAll) =>
  config.sorted.notes.flatMap((path) => {
    const note = notes.find((one) => one.relative === path)
    if (!note) {
      failAll("sorted", `sorted.notes names no note: ${path}`)
      return []
    }
    return [note]
  })

const isDecision = (config) => (note) => decisionId(config, note) !== null

/** Check the shape of the vault. */
export const checkShape = (config, notes, report) => {
  const { fail, failAll } = report
  if (isOn(config, "tables") && config.tables === "forbidden") {
    for (const note of notes) {
      const count = findTables(note.body).length
      if (count > 0 && !config.ruleNotes.includes(note.name)) {
        fail("tables", note.file, `holds ${count} tables. ${FIX}`)
      }
    }
  }
  if (isOn(config, "sorted")) {
    for (const note of sortedNotes(config, notes, failAll)) {
      for (const [a, b] of unsortedPairs(note.body, config.sorted.locale)) {
        fail("sorted", note.file, `"${a}" stands before "${b}". ${FIX}`)
      }
    }
  }
  if (isOn(config, "decision-index") && config.decisionIndex) {
    for (const { block, folder, index } of decisionIndexes(
      config,
      notes,
      isDecision(config)
    )) {
      if (!index) {
        failAll("decision-index", `${folder}: no index note for the decisions`)
      } else if (currentBlock(index.text) !== block) {
        fail("decision-index", index.file, `the decision list is stale. ${FIX}`)
      }
    }
  }
}

/**
 * The new text of every note the fix changes, by file. The order matters: a
 * table becomes a list first, and then the list is sorted.
 */
export const fixShape = (config, notes) => {
  const changed = new Map()
  const text = (note) => changed.get(note.file) ?? note.text
  if (config.tables === "forbidden") {
    for (const note of notes) {
      if (!config.ruleNotes.includes(note.name)) {
        changed.set(note.file, convertTables(text(note)))
      }
    }
  }
  for (const path of config.sorted.notes) {
    const note = notes.find((one) => one.relative === path)
    if (note) {
      changed.set(note.file, sortLists(text(note), config.sorted.locale))
    }
  }
  if (config.decisionIndex) {
    for (const { block, index } of decisionIndexes(
      config,
      notes,
      isDecision(config)
    )) {
      if (index) {
        changed.set(index.file, withBlock(text(index), block))
      }
    }
  }
  for (const note of notes) {
    if (changed.get(note.file) === note.text) {
      changed.delete(note.file)
    }
  }
  return changed
}
