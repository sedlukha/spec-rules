// Small text helpers that every check shares.

/** Two copies of one sentence differ by case, by punctuation and by line breaks. */
export const normalize = (text) =>
  text
    .toLowerCase()
    .replace(/[«»"'`.,;:!?()—–-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()

/** A hyphen and a decimal point sit inside a word. Drop both before counting. */
export const wordCount = (text) => {
  const joined = text.replace(/-/g, "").replace(/(\d)\.(\d)/g, "$1$2")
  return normalize(joined).split(" ").length
}

/**
 * Code holds `**` and `[[` that are not Markdown. A fence goes empty, and its
 * line breaks stay. Inline code loses the given marks only, so the words around
 * it stay whole and every line number stays true.
 */
export const blankCode = (text, marks = /\*/g) =>
  text
    .replace(/(```[\s\S]*?```|~~~[\s\S]*?~~~)/g, (code) =>
      code.replace(/[^\n]/g, "")
    )
    .replace(/`[^`\n]*`/g, (code) => code.replace(marks, " "))

/** A heading or a statement as a reader sees it, with no marks of Markdown. */
export const plainName = (text) =>
  text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*`]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.:!?]$/, "")

/** The line of a match, counted from 1. */
export const lineOf = (text, index) => text.slice(0, index).split("\n").length
