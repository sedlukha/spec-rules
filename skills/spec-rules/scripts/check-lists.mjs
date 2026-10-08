#!/usr/bin/env node
// Match the check lists of a spec vault against the tests, and print the lines
// that have no test yet.
//
//   node check-lists.mjs          counts per list
//   node check-lists.mjs --all    every line with no test, and free ids
//   node check-lists.mjs CHK      one list, and five free ids for it
//
// `check-spec.mjs` runs the same check, with counts alone.

import { start } from "./lib/cli.mjs"
import { checkLists } from "./lib/lists.mjs"
import { createReport, printProblems } from "./lib/report.mjs"

const { config, positionals, values, vault } = await start(
  "Match check lists against tests. Pass --all, or one list prefix such as CHK."
)
const report = createReport()

if (!config.lists) {
  console.error("The config turns the lists off: `lists: null`.")
  process.exit(2)
}

const asked = positionals[0]?.toUpperCase()
console.log(
  checkLists(config, vault.notes, report, values.all ? "all" : asked).join(
    "\n"
  )
)

process.exitCode = printProblems(report.problems)
