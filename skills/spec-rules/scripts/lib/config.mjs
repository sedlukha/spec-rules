// The config of one vault. The scripts hold the rules of the method. The data
// of one vault lives in its own repo, in `spec-rules.config.mjs`.

import { existsSync } from "node:fs"
import { dirname, relative, resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

export const CONFIG_FILE = "spec-rules.config.mjs"

/**
 * @typedef {object} Entry A piece of vault data with its reason.
 * @property {RegExp} pattern What to look for.
 * @property {string} message What the report says when it is found.
 */

/**
 * @typedef {object} Retired A thing a decision took away.
 * @property {RegExp} pattern How a note names the thing. Spell out every letter
 *   class: `\w` and `\b` in JavaScript know only Latin letters.
 * @property {string} thing The thing, in a few words, for the report.
 * @property {string[]} homes Notes that explain why it is gone. Paths are
 *   relative to the vault. A paragraph that names the thing must link one.
 */

/**
 * @typedef {object} Config
 * @property {string} vault The folder of the live vault, from the repo root.
 * @property {"repo" | "obsidian"} naming Names in kebab-case, or in Title Case
 *   with spaces. It sets the index prefix and the default file names.
 * @property {"markdown" | "wikilink"} links The one link style of the vault.
 * @property {string[]} ruleNotes Notes that hold rules about the vault, such
 *   as `AGENTS.md`. They show links by example, so content rules skip them.
 * @property {string[]} statuses The closed list for `status`.
 * @property {string[]} decisionStatuses The closed list for `decision_status`.
 * @property {string[]} goneFields Header fields the vault dropped. A layered
 *   vault drops `type` by default.
 * @property {number} summaryWords The longest `summary`, in words.
 * @property {Entry[]} summaryForbidden Patterns a `summary` must not hold.
 * @property {Entry[]} forbiddenHeadings Headings no note may hold.
 * @property {string[] | null} layers The layer folders. Null: no layers.
 * @property {string[]} rootNotes Notes that may stand at the vault root.
 * @property {boolean} requireIndex Every folder needs one index, not only
 *   at most one.
 * @property {string[]} templates Folders of note templates. A template is not
 *   a note: no rule reads it, and its folder needs no index.
 * @property {{heading: string, none: RegExp | null, registers: string[]} | null} openQuestions
 *   A note's own open questions section must link the register, or match
 *   `none`. The registers themselves hold the questions.
 * @property {string[]} frozen Folders beside the vault, such as a backlog.
 *   Only the link rule and the future rule read them.
 * @property {{dir: string, trigger: string[], exempt: string[]} | null} future
 *   The folder of deferred ideas. A note there names a trigger and links a
 *   live note.
 *
 * A path to a note or a note folder is relative to the vault, so it reads like
 * a link: `../backlog`. A path to code is relative to the repo root.
 * @property {{minWords: number, repeatsOnPurpose: {text: string, why: string}[]}} statements
 *   A bold statement of `minWords` or more lives in one note only.
 * @property {Retired[]} retired Things a decision took away.
 * @property {{marker: string, roots: string[], skip: string[], files: RegExp, decisionWords: string[]} | null} pointers
 *   Code points at the vault with the marker, an arrow and a name.
 * @property {{command: string, dir: string, nameSuffix: string, manualMark: string | null, idLength: number, tests: {roots: string[], skip: string[], testFile: RegExp, storyFile: RegExp}} | null} lists
 *   Check lists, and the tests that close their lines.
 * @property {Record<string, boolean>} rules Set a rule to `false` to turn it off.
 */

/**
 * Folders a walk over code never opens: build output, installed packages, and
 * the agent config, where this skill itself may be installed.
 */
const NOT_CODE = [
  ".cache",
  ".claude",
  ".git",
  ".next",
  ".turbo",
  "coverage",
  "dist",
  "node_modules",
  "playwright",
  "storybook-static",
]

/** How a reader runs the list script, wherever the skill is installed. */
const LISTS_COMMAND = `node ${relative(
  process.cwd(),
  resolve(dirname(fileURLToPath(import.meta.url)), "../check-lists.mjs")
)}`

/** The names each mode gives to the same notes and folders. */
const NAMES = {
  obsidian: {
    future: "Future",
    home: "00 Home.md",
    index: "00 ",
    listSuffix: " Checks.md",
    qa: "QA",
    registers: ["Open Questions.md", "Deferred Questions.md"],
  },
  repo: {
    future: "future",
    home: "00-home.md",
    index: "00-",
    listSuffix: "-checks.md",
    qa: "qa",
    registers: ["open-questions.md", "deferred-questions.md"],
  },
}

/** Every rule the scripts know, by id. */
export const RULES = [
  "empty-note",
  "links",
  "link-style",
  "header",
  "summary",
  "summary-forbidden",
  "forbidden-heading",
  "open-questions",
  "retired",
  "layers",
  "index",
  "decision-number",
  "future",
  "statements",
  "pointers",
  "lists",
]

/** The values a vault gets when its config is silent. */
const defaults = (vault, naming, raw) => {
  const names = NAMES[naming]
  return {
    decisionStatuses: ["accepted", "proposed", "rejected"],
    forbiddenHeadings: [],
    frozen: [],
    future: {
      dir: names.future,
      exempt: [names.registers[1]],
      trigger: ["## Trigger", "trigger:"],
    },
    // A layered vault dropped `type`: the folder says what a note is. An older
    // vault with status folders may keep it.
    goneFields: raw.layers ? ["type"] : [],
    layers: null,
    links: "markdown",
    lists: {
      command: LISTS_COMMAND,
      dir: names.qa,
      idLength: 4,
      manualMark: null,
      nameSuffix: names.listSuffix,
      tests: {
        roots: ["."],
        skip: NOT_CODE,
        storyFile: /\.stories\.[jt]sx?$/,
        testFile: /\.(?:spec|test)\.[jt]sx?$/,
      },
    },
    naming,
    openQuestions: {
      heading: "Open questions",
      none: null,
      registers: names.registers,
    },
    pointers: {
      decisionWords: ["ADR", "decision"],
      files: /\.(css|js|mjs|cjs|ts|tsx|jsx)$/,
      marker: `\`${vault}\``,
      roots: ["."],
      skip: NOT_CODE,
    },
    requireIndex: true,
    retired: [],
    rootNotes: [names.home, "AGENTS.md"],
    ruleNotes: ["AGENTS.md"],
    rules: {},
    statements: { minWords: 4, repeatsOnPurpose: [] },
    statuses: ["current", "future", "archive"],
    summaryForbidden: [],
    summaryWords: 20,
    templates: ["templates", "Templates"],
    vault,
  }
}

/** Keys whose value is a group of settings, merged one level deep. */
const GROUPS = ["future", "lists", "openQuestions", "pointers", "statements"]

const fail = (message) => {
  throw new Error(`spec-rules config: ${message}`)
}

/**
 * The config of the vault: the file merged over the defaults. A key the
 * scripts do not know is an error, so a typo never turns a rule off quietly.
 * @returns {Config}
 */
export const mergeConfig = (raw = {}, fallbackVault = "docs/spec") => {
  const vault = raw.vault ?? fallbackVault
  const naming = raw.naming ?? "repo"
  if (!NAMES[naming]) {
    fail(`naming is "${naming}". Take "repo" or "obsidian".`)
  }
  const base = defaults(vault, naming, raw)

  for (const key of Object.keys(raw)) {
    if (!(key in base)) {
      fail(`unknown key "${key}". Known keys: ${Object.keys(base).join(", ")}`)
    }
  }
  for (const id of Object.keys(raw.rules ?? {})) {
    if (!RULES.includes(id)) {
      fail(`unknown rule "${id}". Known rules: ${RULES.join(", ")}`)
    }
  }

  const config = { ...base, ...raw }
  for (const group of GROUPS) {
    // Null turns the whole group off. An object changes only the keys it names.
    if (raw[group] && base[group]) {
      for (const key of Object.keys(raw[group])) {
        if (!(key in base[group])) {
          fail(`unknown key "${group}.${key}"`)
        }
      }
      config[group] = { ...base[group], ...raw[group] }
    }
  }
  if (raw.lists?.tests) {
    config.lists.tests = { ...base.lists.tests, ...raw.lists.tests }
  }
  if (!["markdown", "wikilink"].includes(config.links)) {
    fail(`links is "${config.links}". Take "markdown" or "wikilink".`)
  }
  config.index = NAMES[naming].index
  return config
}

/**
 * Load the config file. With no `--config` the scripts look for
 * `spec-rules.config.mjs` in the working folder. With no file at all they run
 * on the defaults.
 */
export const loadConfig = async ({ path, vault } = {}) => {
  const file = resolve(path ?? CONFIG_FILE)
  if (path && !existsSync(file)) {
    fail(`no file at ${path}`)
  }
  const raw = existsSync(file)
    ? (await import(pathToFileURL(file).href)).default
    : {}
  return mergeConfig(vault ? { ...raw, vault } : raw)
}

/** Whether the config turns a rule on. */
export const isOn = (config, id) => config.rules[id] !== false
