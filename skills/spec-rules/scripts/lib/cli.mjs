// The command line both scripts share.

import { parseArgs } from "node:util"
import { loadConfig } from "./config.mjs"
import { readVault } from "./vault-rules.mjs"

const HELP = `Options:
  --config <file>  the config file (default: spec-rules.config.mjs)
  --vault <dir>    the vault folder, over the one in the config
  --help           show this text`

/** Read the arguments and the config, and read the vault once. */
export const start = async (usage) => {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
      all: { type: "boolean" },
      config: { type: "string" },
      help: { type: "boolean" },
      vault: { type: "string" },
    },
  })
  if (values.help) {
    console.log(`${usage}\n\n${HELP}`)
    process.exit(0)
  }
  try {
    const config = await loadConfig({
      path: values.config,
      vault: values.vault,
    })
    return { config, positionals, values, vault: readVault(config) }
  } catch (error) {
    console.error(error.message)
    process.exit(2)
  }
}
