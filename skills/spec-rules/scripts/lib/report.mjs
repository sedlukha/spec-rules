// One list of problems for a run. Each problem names the rule that found it,
// so a reader knows which key of the config to look at.

export const createReport = () => {
  const problems = []
  return {
    /** A problem in one file. */
    fail: (rule, file, message) =>
      problems.push({ rule, text: `${file}: ${message}` }),
    /** A problem that belongs to no single file. */
    failAll: (rule, message) => problems.push({ rule, text: message }),
    problems,
  }
}

/** Print the problems. Returns the exit code. */
export const printProblems = (problems) => {
  if (problems.length === 0) {
    console.log("no problems")
    return 0
  }
  console.error(`\n${problems.length} problems:\n`)
  for (const problem of problems) {
    console.error(`  ${problem.text} [${problem.rule}]`)
  }
  return 1
}
