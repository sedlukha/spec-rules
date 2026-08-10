# Obsidian-first Specification Design

A method (and Claude Code skill) for writing software specifications as a **living
knowledge base in Obsidian** — linked notes, ADRs, status separation, and embedded
Mermaid diagrams — instead of one big linear document.

It combines a few well-worn ideas into one operating model:

- **Zettelkasten** — atomic, densely linked notes instead of one monolith.
- **Domain-Driven Design** — entities + ubiquitous language, never modeled without scenarios.
- **ADRs** (Architecture Decision Records) — every decision recorded with context and alternatives.
- **Trigger-driven deferral** — every deferred idea carries the exact signal that means
  "build it now", so decisions are postponed on purpose, not forgotten. Open questions
  split by status the same way. A release blocker never hides among the rest.

## Requirements

This is **Obsidian-first**. The value comes from `[[wikilinks]]`, backlinks, graph view,
properties, and tags. It works in plain Markdown, but you lose most of the payoff.

**Also need it on GitHub or Confluence?** Use **relative Markdown links**
(`[Note Name](path/Note%20Name.md)`) instead of wikilinks — they resolve in both Obsidian
and those viewers, and Mermaid renders natively on GitHub. The cost is losing Obsidian's
rename-aware links. See *Rendering outside Obsidian* in `SKILL.md`.

## What's in here

```
skills/spec-rules/
  SKILL.md                          The method, as an agent skill (skills.sh entrypoint)
  templates/                        Note templates, installed with the skill
    Entity Template.md
    Scenario Template.md
    ADR Template.md
    Diagram Template.md
    Future Candidate Template.md
    Open Questions Template.md
    Deferred Questions Template.md
```

## Use as an Obsidian vault scaffold

1. Copy `skills/spec-rules/templates/` into your vault's `Templates/` folder.
2. Create the status folders `Current/`, `Future/`, `Archive/` and the MOC index notes
   (`00 Home`, `Current Index`, ...). See the recommended vault structure in `SKILL.md`.
3. Point Obsidian's core **Templates** plugin at your `Templates/` folder.
4. Start capturing entities, scenarios, and ADRs as linked notes.

## Use as an agent skill

Install with the [skills.sh](https://skills.sh) CLI (works with Claude Code, Codex,
Cursor, OpenCode, and others):

```bash
npx skills add sedlukha/spec-rules
```

This installs `skills/spec-rules/` — `SKILL.md` plus its `templates/`. Or copy that
folder manually into your skills directory (e.g. `.claude/skills/spec-rules/`).

The skill is explicit-invocation only (`disable-model-invocation: true`) — call it when
you want help building or maintaining an Obsidian spec vault. To let the model trigger
it automatically, remove that line from the frontmatter.

## The one-line summary

```
Scenarios explain why.
Architecture explains how.
Entities explain what.
ADR explains why this way.
Diagrams explain visually.
Future notes preserve what is not current yet.
Obsidian links connect everything.
```
