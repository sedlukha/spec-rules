# The spec lives next to the code

A method (and an agent skill) for keeping a software spec beside the code it
describes. The code says what the product does. The spec says why, and what we
chose not to do.

| What | Where it lives |
| --- | --- |
| A reason for one place in the code | A comment at that place |
| A number | A named constant, with its reason in a comment |
| A rule that spans several files of one part | The `CLAUDE.md` of the package that owns the part |
| What the product is, for whom, its main paths | A short product spec for people, in `docs/spec` |
| A bug, a plan, an open question | An issue |

A `CLAUDE.md` holds only three kinds of text: a rule that spans several files,
a rejected way, and a rule of absence. It never retells the code. One fact lives
in one file, and a comment points at it by heading or by symbol.

## Why not a vault of linked notes

Earlier versions of this skill described a spec as a vault of small linked
notes. In practice such a vault retold the code, and a large share of it went
stale. Its notes pointed at each other in long chains, and an agent spent its
context on them. A `CLAUDE.md` in the package folder reaches the agent by
itself: Claude Code loads it when it works in that folder.

The old vault method is in the git history of this repo. Its check scripts stay
in `skills/spec-rules/scripts/` while a repo moves its old vault out.

## What's in here

```
skills/spec-rules/
  SKILL.md                          The method, as an agent skill
  scripts/                          The check of an old vault, for the move
    check-spec.mjs                  Checks the vault against its invariants
    check-lists.mjs                 Matches the check lists against the tests
    fix-spec.mjs                    Rewrites notes for the merge rules
    spec-rules.config.example.mjs   The data of one vault, as an example
    README.md                       Every rule and every config key
```

## Use as an agent skill

Install with the [skills.sh](https://skills.sh) CLI (works with Claude Code, Codex,
Cursor, OpenCode, and others):

```bash
npx skills add sedlukha/spec-rules
```

This installs `skills/spec-rules/`. Or copy that folder by hand into your skills
directory, for example `.claude/skills/spec-rules/`.

The model can start the skill on its own, when the work looks like spec
writing. To make it explicit only, add `disable-model-invocation: true` to the
frontmatter. Then it runs when you call it by name, and never on its own.
