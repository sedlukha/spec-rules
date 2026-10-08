#!/usr/bin/env node
// Check a spec vault against the invariants of the spec-rules skill. It reads
// the vault, the check lists and the code that points at the vault. It needs
// only Node, so a CI step can run it before any install.
//
//   node check-spec.mjs [--config spec-rules.config.mjs] [--vault docs/spec]
//
// The rules live here. The data of one vault lives in its own config file:
// see `README.md` beside this file.

import { isOn } from "./lib/config.mjs"
import { start } from "./lib/cli.mjs"
import { checkLists } from "./lib/lists.mjs"
import { checkPointers } from "./lib/pointers.mjs"
import { createReport, printProblems } from "./lib/report.mjs"
import { checkStatements } from "./lib/statements.mjs"
import { checkVault } from "./lib/vault-rules.mjs"

const { config, vault } = await start(
  "Check a spec vault: links, headers, layers, statements, pointers and lists."
)
const report = createReport()

const { decisions } = checkVault(config, vault, report)
if (isOn(config, "statements")) {
  checkStatements(config, vault.notes, report)
}
const pointers =
  isOn(config, "pointers") && config.pointers
    ? checkPointers(config, vault.notes, decisions, report)
    : 0

console.log(
  `checked ${vault.notes.length} notes and ${pointers} pointers from code`
)

if (isOn(config, "lists") && config.lists) {
  console.log(checkLists(config, vault.notes, report).join("\n"))
}

process.exitCode = printProblems(report.problems)
