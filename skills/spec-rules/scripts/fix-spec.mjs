#!/usr/bin/env node

// Rewrite a spec vault into the shape `check-spec.mjs` asks for. It turns each
// table into a list, puts the lists of `sorted.notes` in order, and builds each
// decision index. Run it again after a merge conflict in such a note: take
// either side, then let the script write the result.
//
//   node fix-spec.mjs [--config spec-rules.config.mjs] [--vault docs/spec]
//
// It only writes the notes. Read the diff before you commit it.

import { writeFileSync } from "node:fs"
import { start } from "./lib/cli.mjs"
import { fixShape } from "./lib/shape.mjs"

const { config, vault } = await start(
  "Rewrite a spec vault: tables into lists, sorted lists, decision indexes."
)

const changed = fixShape(config, vault.notes)
for (const [file, text] of changed) {
  writeFileSync(file, text)
  console.log(`rewrote ${file}`)
}
console.log(`${changed.size} notes changed`)
