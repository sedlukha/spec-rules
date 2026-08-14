# Specification as a linked knowledge base

A method (and Claude Code skill) for writing software specifications as a **living
knowledge base** — linked notes, ADRs, status separation, and embedded Mermaid
diagrams — instead of one big linear document. It is built for Obsidian, and it
reads on GitHub too.

It combines a few well-worn ideas into one operating model:

- **Zettelkasten** — atomic, densely linked notes instead of one monolith.
- **Domain-Driven Design** — entities + ubiquitous language, never modeled without scenarios.
- **ADRs** (Architecture Decision Records) — every decision recorded with context and alternatives.
- **Trigger-driven deferral** — every deferred idea carries the exact signal that means
  "build it now", so decisions are postponed on purpose, not forgotten. Open questions
  split by status the same way. A release blocker never hides among the rest.

## Pick a mode first

A vault stores the same notes in one of two shapes, and the skill asks you to pick
one before the first note.

**Repo mode is the default.** The vault lives in a git repo, and people read it on
GitHub too. Names are kebab-case, and every body link is a relative Markdown link.
Those links resolve in Obsidian and on GitHub, and Mermaid renders natively on
GitHub. The cost is Obsidian's rename-aware links.

**Obsidian mode** is for a vault that lives in Obsidian and nowhere else. Names are
Title Case with spaces, and links are `[[wikilinks]]`. GitHub shows a wikilink as
plain text in brackets, so pick this mode only when nobody reads the vault there.

Either way the payoff comes from backlinks, graph view, properties, and tags. See
*Pick the vault mode first* in `SKILL.md`.

## What's in here

```
skills/spec-rules/
  SKILL.md                          The method, as an agent skill (skills.sh entrypoint)
  templates/                        Note templates, installed with the skill
    entity-template.md
    scenario-template.md
    adr-template.md
    diagram-template.md
    future-candidate-template.md
    open-questions-template.md
    deferred-questions-template.md
    screen-template.md
    routing-template.md
```

## Use as a vault scaffold

1. Copy `skills/spec-rules/templates/` into your vault's `templates/` folder.
2. Create the status folders `current/`, `future/`, `archive/` and the MOC index
   notes (`00-home.md`, `00-current-index.md`, ...). See the recommended vault
   structure in `SKILL.md`.
3. Point Obsidian's core **Templates** plugin at your `templates/` folder.
4. Start capturing entities, scenarios, screens, and ADRs as linked notes.

## Use as an agent skill

Install with the [skills.sh](https://skills.sh) CLI (works with Claude Code, Codex,
Cursor, OpenCode, and others):

```bash
npx skills add sedlukha/spec-rules
```

This installs `skills/spec-rules/` — `SKILL.md` plus its `templates/`. Or copy that
folder manually into your skills directory (e.g. `.claude/skills/spec-rules/`).

The skill is explicit-invocation only (`disable-model-invocation: true`) — call it when
you want help building or maintaining a spec vault. To let the model trigger
it automatically, remove that line from the frontmatter.

## The one-line summary

```
Scenarios explain why.
Architecture explains how.
Entities explain what.
ADR explains why this way.
Diagrams explain visually.
Future notes preserve what is not current yet.
Links connect everything.
```
