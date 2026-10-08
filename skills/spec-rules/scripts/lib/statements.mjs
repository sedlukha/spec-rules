// One statement, one owner. A rule in a vault is almost always bold, so a copy
// of one can be collected and compared. This catches a copy. A retelling in
// other words it never catches, and no script can.

import { blankCode, lineOf, normalize, wordCount } from "./text.mjs"

export const checkStatements = (config, notes, report) => {
  const { minWords, repeatsOnPurpose } = config.statements
  const statements = new Map()

  for (const note of notes) {
    if (config.ruleNotes.includes(note.name)) {
      continue
    }
    const text = blankCode(note.text)
    for (const match of text.matchAll(/\*\*(.+?)\*\*/gs)) {
      // Bold ends at a blank line. A span that holds one is two stars, not bold.
      if (match[1].includes("\n\n")) {
        continue
      }
      const statement = match[1].replace(/\s+/g, " ").trim()
      // Shorter than this, a bold phrase is a name or a number.
      if (wordCount(statement) < minWords) {
        continue
      }
      const key = normalize(statement)
      const found = statements.get(key) ?? { places: [], statement }
      found.places.push({ file: note.file, line: lineOf(text, match.index) })
      statements.set(key, found)
    }
  }

  // Wording that repeats on purpose. Each entry carries its reason.
  const allowed = new Map(
    repeatsOnPurpose.map((entry) => [normalize(entry.text), entry])
  )
  // Two entries with one key would collapse, and the dead one would stay quiet.
  if (allowed.size !== repeatsOnPurpose.length) {
    report.failAll("statements", "two allowed statements share one key")
  }
  const used = new Set()

  for (const [key, found] of statements) {
    // A note that repeats itself is a smaller fault. The rule is about owners.
    const files = new Set(found.places.map((place) => place.file))
    if (files.size < 2) {
      continue
    }
    if (allowed.has(key)) {
      used.add(key)
      continue
    }
    const places = found.places
      .map((place) => `${place.file}:${place.line}`)
      .join(", ")
    report.failAll(
      "statements",
      `one statement lives in ${files.size} notes: «${found.statement}» — ${places}`
    )
  }

  // An entry that catches nothing is dead. It reads as a decision and holds none.
  for (const [key, entry] of allowed) {
    if (!used.has(key)) {
      report.failAll(
        "statements",
        `nothing repeats this allowed statement: «${entry.text}»`
      )
    }
  }
}
