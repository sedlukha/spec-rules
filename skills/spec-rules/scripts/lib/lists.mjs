// Match the check lists of the vault against the tests in the code. A note is
// a list when its header holds `checks: CHK`. Every line of a list carries an
// id like `CHK-k3f9`. A test that closes the line names `@CHK-k3f9`.

import { randomInt } from "node:crypto"
import { readFileSync } from "node:fs"
import { basename, join } from "node:path"
import { exists, walk } from "./files.mjs"

/** `- \`CHK-k3f9\` text`. An id of digits alone is an old one, and still good. */
const CHECK_LINE = /^- `([A-Z]{2,6})-([0-9a-z]+)`\s*(.*)$/

/**
 * `test("name")`, `it.only("name")`. The chain tells a name from a block. The
 * call has to open its own line: the anchor keeps the reader out of comments
 * and strings, where `it(` would read as a call.
 */
const TEST_CALL =
  /^[ \t]*(?:test|it)((?:\.\w+)*)\s*\(\s*(['"`])((?:\\.|(?!\2)[^\\])*)\2/gm

/** `test.describe` and `test.step` carry a block, not a test name. */
const NOT_A_TEST = /\b(?:describe|step)\b/

/** `checks: ["@CHK-36"]` inside the parameters of a story. */
const CHECKS_ARRAY = /\bchecks:\s*\[([^\]]*)\]/g

/**
 * The signs a new id is drawn from. It holds no `0`, `1`, `i`, `l` or `o`,
 * because each of those reads as another one. People retype an id by hand.
 */
const ID_SIGNS = "23456789abcdefghjkmnpqrstuvwxyz"

/** Read every check list of the vault. */
const readLists = (config, notes, report) => {
  const { dir, manualMark, nameSuffix } = config.lists
  const qa = `${join(config.vault, dir)}/`
  const checks = new Map()
  const lists = []
  // An id used twice waits until every list is read. A free id is only known
  // then, and the message names one.
  const duplicates = []

  for (const note of notes) {
    const prefix = note.text.match(/^checks:\s*([A-Z]{2,6})\s*$/m)?.[1]
    const inQa = note.file.startsWith(qa)
    if (!prefix) {
      if (inQa && note.name.endsWith(nameSuffix)) {
        report.fail(
          "lists",
          note.file,
          "the list has no `checks` prefix in its header"
        )
      }
      continue
    }
    if (!inQa) {
      report.fail("lists", note.file, `a check list lives only in ${dir}/`)
      continue
    }

    const list = { file: note.file, lines: [], prefix }
    lists.push(list)

    for (const raw of note.body.split("\n")) {
      if (!raw.startsWith("- ")) {
        continue
      }
      const match = raw.match(CHECK_LINE)
      if (!match) {
        report.fail(
          "lists",
          note.file,
          `a check line carries no id: ${raw.slice(0, 60)}`
        )
        continue
      }
      const [, found, number, rest] = match
      if (found !== prefix) {
        report.fail(
          "lists",
          note.file,
          `${found}-${number} does not belong to this list`
        )
        continue
      }
      const id = `${found}-${number}`
      if (checks.has(id)) {
        duplicates.push({ file: note.file, id, list })
        continue
      }
      const manual = Boolean(manualMark) && rest.startsWith(manualMark)
      const line = {
        id,
        list,
        manual,
        tests: [],
        text: (manual ? rest.replace(manualMark, "") : rest).trim(),
      }
      checks.set(id, line)
      list.lines.push(line)
    }
  }
  return { checks, duplicates, lists }
}

/**
 * Where a tag may stand in this file, as places and not as strings. A test
 * writes it in its own name, and a story writes it in `parameters.checks`.
 * Comparing places catches a stray copy of a real tag.
 */
const tagPlaces = (config, file, text) => {
  if (config.lists.tests.storyFile.test(file)) {
    return [...text.matchAll(CHECKS_ARRAY)].map((match) => ({
      from: match.index + match[0].length - match[1].length - 1,
      name: match[1].trim(),
      to: match.index + match[0].length,
    }))
  }
  return [...text.matchAll(TEST_CALL)]
    .filter(([, chain]) => !NOT_A_TEST.test(chain))
    .map((match) => {
      // The match ends on the closing quote, so the name ends one char before
      // it. Without that, a tag written first in the name falls outside.
      const end = match.index + match[0].length - 1
      return { from: end - match[3].length, name: match[3], to: end }
    })
}

/**
 * Check the lists and the tags. `detail` is undefined for counts alone, "all"
 * for every line, or one list prefix.
 */
export const checkLists = (config, notes, report, detail) => {
  const { idLength, tests } = config.lists
  const { checks, duplicates, lists } = readLists(config, notes, report)
  const out = []

  /** The ids this run gave out, so it never offers one of them twice. */
  const issued = new Set()

  /**
   * An id no line of this list holds. It is drawn, never counted up from the
   * largest id: two branches that count reach the same number.
   */
  const freeId = (list) => {
    let id
    do {
      const drawn = Array.from(
        { length: idLength },
        () => ID_SIGNS[randomInt(ID_SIGNS.length)]
      ).join("")
      id = `${list.prefix}-${drawn}`
    } while (checks.has(id) || issued.has(id))
    issued.add(id)
    return id
  }

  for (const { file, id, list } of duplicates) {
    report.fail("lists", file, `${id} is used twice. A free id here is ${freeId(list)}`)
  }

  // Only the codes the lists declare. A wider pattern would fail on a fixture
  // that holds a word of the same shape, such as a ticket number.
  const codes = [...new Set(lists.map((list) => list.prefix))]
  const tag =
    codes.length > 0
      ? new RegExp(`@(?:${codes.join("|")})-[0-9a-z]+`, "g")
      : null

  const skipped = new Set(tests.skip)
  const codeFiles = tests.roots
    .filter((root) => exists(root))
    .flatMap((root) => walk(root, skipped))
    .filter((file) => tests.testFile.test(file) || tests.storyFile.test(file))

  let tagged = 0
  for (const file of tag ? codeFiles : []) {
    const text = readFileSync(file, "utf8")
    const places = tagPlaces(config, file, text)

    for (const place of places) {
      const tags = [...place.name.matchAll(tag)].map(([found]) => found)
      if (tags.length === 0) {
        continue
      }
      tagged += 1
      for (const found of tags) {
        const line = checks.get(found.slice(1))
        if (line) {
          line.tests.push({ file, name: place.name })
        } else {
          report.fail(
            "lists",
            file,
            `${found} names a check line the spec does not have`
          )
        }
      }
    }

    // A tag anywhere else reads as coverage and gives none.
    for (const match of text.matchAll(tag)) {
      const held = places.some(
        (place) => match.index >= place.from && match.index < place.to
      )
      if (!held) {
        report.fail("lists", file, `${match[0]} stands where nothing reads it`)
      }
    }
  }

  // A vault may say every line is a machine line. Then a check the run cannot
  // take is not written as a line, and the mark itself is the fault.
  const mark = config.lists.manualMark?.replace(/\*/g, "")
  for (const line of checks.values()) {
    if (line.manual) {
      report.fail(
        "lists",
        line.list.file,
        `${line.id} carries «${mark}», and no check line may. ` +
          "A check the run cannot take is not written as a line."
      )
    }
  }

  const gaps = [...checks.values()].filter((line) => line.tests.length === 0)
  const all = detail === "all"
  const only = all ? undefined : detail

  out.push(
    `checked ${checks.size} check lines in ${lists.length} lists, ` +
      `and ${tagged} tagged tests in ${codeFiles.length} files of tests`
  )

  if (only && !codes.includes(only)) {
    report.failAll(
      "lists",
      `${only} is no list of the vault. Take one of ${codes.join(", ")}.`
    )
    return out
  }

  // Adding a check line? Take an id from here, never one you made up yourself.
  if (all || only) {
    out.push("", "free ids, take any:", "")
    for (const list of lists.filter((one) => all || one.prefix === only)) {
      const free = Array.from({ length: 5 }, () => freeId(list))
      out.push(`  ${list.prefix}  ${free.join("  ")}`)
    }
  }

  if (gaps.length > 0) {
    out.push("", `${gaps.length} machine lines with no test:`, "")
    for (const list of lists) {
      const missing = list.lines.filter((line) => gaps.includes(line))
      if (missing.length === 0) {
        continue
      }
      out.push(`  ${list.prefix}  ${basename(list.file, ".md")} —${missing.length}`)
      if (!(all || list.prefix === only)) {
        continue
      }
      for (const line of missing) {
        out.push(`      ${line.id}  ${line.text}`)
      }
      out.push("")
    }
  }

  const covered = [...checks.values()].filter((line) => line.tests.length > 0)
  out.push(`${covered.length} lines have a test`)

  if (gaps.length > 0 && !(all || only)) {
    out.push(
      "",
      `The lines themselves: \`${config.lists.command} --all\`, or one list ` +
        `by its code, such as \`${config.lists.command} ${codes[0]}\`.`
    )
  }
  return out
}
