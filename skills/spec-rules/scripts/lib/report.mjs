// One list of problems for a run. Each problem names the rule that found it,
// so a reader knows which key of the config to look at.
//
// A warning is a signal, not a fault. It asks for a small cut during normal
// work. It prints after the problems and never changes the exit code.

export const createReport = () => {
  const problems = []
  const warnings = []
  return {
    /** A problem in one file. */
    fail: (rule, file, message) =>
      problems.push({ rule, text: `${file}: ${message}` }),
    /** A problem that belongs to no single file. */
    failAll: (rule, message) => problems.push({ rule, text: message }),
    problems,
    /** A warning in one file. */
    warn: (rule, file, message) =>
      warnings.push({ rule, text: `${file}: ${message}` }),
    warnings,
  }
}

const printList = (title, items) => {
  console.error(`\n${items.length} ${title}:\n`)
  for (const item of items) {
    console.error(`  ${item.text} [${item.rule}]`)
  }
}

/** Print the problems, then the warnings. Returns the exit code. */
export const printProblems = (problems, warnings = []) => {
  if (problems.length === 0) {
    console.log("no problems")
  } else {
    printList("problems", problems)
  }
  if (warnings.length > 0) {
    printList("warnings", warnings)
  }
  return problems.length === 0 ? 0 : 1
}
