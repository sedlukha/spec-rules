// An example config for the vault check. Copy it to the root of the vault's
// repo as `spec-rules.config.mjs`, and keep only the keys you change. Every key
// here shows its default, or an example where the default is empty.

export default {
  // The live vault, from the repo root.
  vault: "docs/spec",
  // "repo": kebab-case names and `00-` indexes. "obsidian": Title Case names
  // with spaces and `00 ` indexes.
  naming: "repo",
  // "markdown": relative Markdown links. "wikilink": `[[Note]]`.
  links: "markdown",

  // The layer folders. Null means the vault splits by status folders instead.
  layers: ["core", "product", "content", "design", "code", "qa"],
  rootNotes: ["00-home.md", "AGENTS.md"],

  // Folders beside the vault, such as a backlog. Only links and the future
  // rule read them.
  frozen: ["../spec-backlog"],
  future: {
    dir: "../spec-backlog/future",
    trigger: ["## Trigger", "trigger:"],
    exempt: ["deferred-questions.md"],
  },

  openQuestions: {
    heading: "Open questions",
    // A section with no link passes when it says it has no questions.
    none: /none yet/i,
    registers: ["open-questions.md", "deferred-questions.md"],
  },

  // A pattern no heading may match, and what the report says.
  forbiddenHeadings: [
    {
      pattern: /^#+[ \t]*Supersession[ \t]*$/im,
      message: "a decision note holds a section about being replaced",
    },
  ],

  // A pattern no summary may match.
  summaryForbidden: [
    {
      pattern: /\b(two|three|four|five|\d+)\s+parts\b/i,
      message: "summary counts the parts of the folder",
    },
  ],

  statements: {
    minWords: 4,
    repeatsOnPurpose: [
      {
        text: "Paid means delivered.",
        why: "the name of a rule. Each note links its owner",
      },
    ],
  },

  // Things a decision took away. A note that names one links a home.
  retired: [
    {
      pattern: /free\s+download\s+limit/i,
      thing: "the free download limit",
      homes: ["product/adr/adr-009-one-payment-and-no-free-download.md"],
    },
  ],

  pointers: {
    roots: ["src"],
    decisionWords: ["ADR", "decision"],
  },

  lists: {
    command: "pnpm check:lists",
    // A vault where every line is a machine line forbids a manual mark.
    manualMark: "**Manual.**",
    tests: { roots: ["src", "e2e"] },
  },

  // Turn single rules off by id. The README lists every id.
  rules: { "summary-forbidden": true },
}
