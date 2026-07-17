---
name: spec-rules
description: "Write a spec as a linked knowledge base of atomic notes — entities, scenarios, ADRs with supersession tracking, status separation, and embedded Mermaid diagrams."
disable-model-invocation: true
allowed-tools: Read, Glob, Edit, Write, AskUserQuestion
---

# spec-rules — specification as a linked knowledge base

## Core principle

Treat any complex spec as a living knowledge base, not one big linear document.

Instead of one huge file, build a system of linked notes:

- current architecture;
- future ideas;
- user scenarios;
- entities;
- diagrams;
- open questions;
- architecture decisions;
- rejected / superseded ideas;
- roadmap;
- glossary / ubiquitous language.

The docs must answer not only "what are we building?" but also:

- why this decision was made;
- which alternatives were considered;
- what is deferred to later;
- what is no longer current;
- which user scenarios are supported;
- which entities take part in each scenario;
- which diagrams explain the current model;
- what must happen for a future idea to become a current decision.

## Use the full power of Obsidian

Use everything Obsidian offers. Do not treat it as a plain folder of Markdown files.

### 1. Internal links

Link notes with Obsidian links:

```text
[[Order]]
[[Customer]]
[[User Scenario - Complete Checkout]]
[[ADR-003 Order versioning]]
```

Every important entity, scenario, decision, or diagram must be a linkable object.

### 2. Backlinks

Design the docs so backlinks are useful.

For example, when you open the `Order` note, you should see:

- which scenarios use it;
- which diagrams include it;
- which ADRs affect it;
- which future ideas propose to change it;
- which open questions relate to it.

### 3. Graph view

The note structure must work well in graph view.

Avoid isolated files. Link important notes to each other with meaningful links.

Graph view should help you see:

- central entities;
- overloaded parts of the model;
- weakly linked parts of the spec;
- links between scenarios, entities, and architecture decisions.

### 4. Tags

Use tags for status, type, and stage. The values below are examples — replace the
domain-specific ones (the last block) with tags that fit your own stack:

```text
#current
#future
#archive
#entity
#scenario
#adr
#diagram
#open-question
#decision
#stage-1
#stage-2-candidate
#needs-review

# domain/stack-specific examples — swap for your own:
#infra
#integration
```

Tags must help you filter the docs fast.

### 5. Mermaid

Use Mermaid for diagrams:

- flowchart for processes;
- erDiagram for data models;
- stateDiagram for lifecycle;
- sequenceDiagram for interactions;
- classDiagram for object models when needed;
- mindmap or graph for overview maps, if the environment supports them.

Diagrams must not be the only form of docs. Every diagram needs:

- purpose;
- what matters;
- how to read it;
- limits;
- related entities;
- related scenarios;
- related ADRs;
- open questions.

### 6. Properties / YAML frontmatter

Use properties for machine-readable metadata.

Example for a current entity:

```yaml
---
type: entity
status: current
stage: stage-1
tags:
  - entity
  - current
  - stage-1
related:
  - "[[Customer]]"
  - "[[Invoice]]"
---
```

For future ideas:

```yaml
---
type: future-candidate
status: future
likely_stage: stage-2
trigger: "Need per-region tax metadata"
tags:
  - future
  - entity-candidate
  - stage-2-candidate
---
```

### 7. Templates

Create and use note templates. This package ships five in `templates/`:

- Entity template;
- User Scenario template;
- ADR template;
- Diagram template;
- Future Candidate template.

Optional, not shipped (add a template file before referencing): Open Question,
Glossary Term, Pipeline / Process.

### 8. Index / MOC notes

Use MOC (Map of Content) notes. One index per folder, always named with the
`00 ` prefix so it sorts to the top and there is exactly one index per folder:

- `00 Home`
- `00 Current Index`
- `00 Future Index`
- `00 Architecture Index`
- `00 Entity Index`
- `00 Scenario Index`
- `00 ADR Index`
- `00 Diagram Index`
- `00 Open Questions Index`

Exactly one index file per folder. A second index (e.g. an empty `ADR Index.md`
next to `00 ADR Index.md`) is a defect — see [Invariants](#invariants-machine-checkable).

Indexes must be navigation hubs, not just file lists.

### 9. Status separation

Split docs by status:

```text
Current/
Future/
Archive/
```

- `Current` — the live spec;
- `Future` — ideas, candidates, Stage 2+ guesses;
- `Archive` — outdated, rejected, or superseded material.

Do not mix live architecture and future ideas in one layer without a clear status.

**Archive trigger and tombstones.** A note moves to `Archive` when one of these is true:

- its ADR Status becomes `Superseded` or `Rejected`;
- its entity/scenario is fully replaced and nothing in `Current` links to it as live.

When you archive a note, do **not** delete it silently. Leave a one-line **tombstone**
in place of the old content (or at the top of the archived file) that points to the
replacement, so backlinks and graph paths still resolve:

```text
> Archived 2026-06-23. Superseded by [[ADR-024 Plan stored as topic_folders subtree]].
```

Archiving is a deliberate step, not a cleanup you skip. If superseded material stays in
`Current`, it reads as live truth and misleads the next reader (this is the most common
decay mode of a large vault).

### 10. Progressive refinement

The docs grow step by step:

```text
raw idea
→ future candidate
→ discussed option
→ accepted ADR
→ current specification
→ implemented
→ superseded/archive
```

Every idea must have a clear status.

## Recommended vault structure

```text
Project/
  00 Home.md
  01 Product Vision.md
  02 Glossary.md
  03 Open Questions.md

  Current/
    00 Current Index.md

    Architecture/
      00 Architecture Index.md
      Core Flow.md                      (holds a flow diagram)
      Core Domain Model.md
      Data Model.md                     (holds an ER diagram)
      Process Model.md                  (holds a pipeline diagram)
      Lifecycle Model.md                (holds a state diagram)

    Entities/
      00 Entity Index.md

    User Scenarios/
      00 User Scenarios Index.md

    ADR/
      00 ADR Index.md

  Future/
    00 Future Index.md

    Architecture Ideas/
    Entity Candidates/
    User Scenarios/
    ADR Candidates/

  Archive/
    Superseded Ideas/
    Old Drafts/

  Templates/
    Entity Template.md
    Scenario Template.md
    ADR Template.md
    Future Candidate Template.md
    Diagram Template.md
```

## Embed diagrams in architecture files

**Do not create a separate `Diagrams/` folder.**

Embed each diagram in the file it explains:

- **ER Diagram** → embed in `Data Model.md` (with tables and rules explained)
- **Workflow/Process diagrams** → embed in `Process Model.md` or `Core Flow.md`
- **State diagrams** → embed in `Lifecycle Model.md`
- **Architecture diagrams** → embed in the matching `Architecture/*.md`

Each diagram must have, in the same file:

- **Purpose** — what it explains
- **Scope** — what is in / out
- **Key takeaways** — main points
- **Related entities** — links to entities
- **Related scenarios** — links to scenarios
- **Related ADR** — links to decisions

### Why not a separate folder

- **Navigation** — when you read about Data Model, you see the ER diagram right there
- **Consistency** — the diagram stays current, next to its description
- **Backlinks** — Entity → Architecture file with the diagram (no in-between folder)
- **Updates** — change the architecture → update the diagram in one place
- **Graph view** — links between components are clearer

## Note templates

### Entity note

```text
# Entity Name

## Purpose
What the entity represents.

## Status
Current / Future / Archive.

## Fields
List of fields and their meaning.

## Relations
Which entities it links to.

## Used in scenarios
Links to user scenarios.

## Used in diagrams
Links to diagram notes.

## Architecture decisions
Links to ADRs.

## Limits
What must not be broken.

## Future notes
What may change later.

## Open questions
Unsolved questions.
```

### User scenario note

```text
# User Scenario Name

## User goal
What the user wants to get.

## Context
Inputs, limits, preconditions.

## Main scenario
Step-by-step happy path.

## Alternative scenarios
Errors, empty states, edge cases.

## System actions
What the system does at each step.

## Affected entities
Links to entity notes.

## Affected processes
Links to process / pipeline notes.

## Mermaid diagram
The scenario diagram.

## Open questions
What still needs deciding.
```

### ADR note

```text
# ADR-XXX Decision Title

> ⚠️ Banner (only if superseded). Pin a one-liner at the very top so the reader
> sees it before the body:
> "Partially superseded by [[ADR-024 ...]] — storage model only; the decision below still holds."

## Status
Proposed / Accepted / Accepted (partially superseded) / Superseded / Rejected.

## Context
Why the question came up.

## Decision
What was decided.

## Alternatives
Which options were considered.

## Consequences
What this makes easier, harder, or deferred.

## Revisit trigger
When to review the decision.

## Supersession
- Supersedes: links to ADRs this one replaces (whole or in part).
- Superseded by: links to ADRs that replace this one, with WHICH PART
  (e.g. "[[ADR-024]] — physical storage; semantic independence still holds").

## Related notes
Links to entities, scenarios, diagrams.
```

### Future candidate note

```text
# Future Candidate Name

## Status
Future candidate.

## Likely stage
Roughly when it may be needed.

## Trigger
The exact signal that means it is time to move the idea to Current.

## Problem
Which problem it solves.

## Proposed model
What the solution may look like.

## Why not current
Why we do not add it now.

## Migration path
What to change when moving it to Current.

## Related current notes
Links to current entities, scenarios, ADRs.
```

### Diagram inside an architecture file

Embed the diagram in an architecture file (e.g. `Data Model.md`), not a separate file.

Structure:

```text
# Data Model

## Summary
...

## Tables
...

## ER diagram Stage 1

Entities and relations:

```mermaid
erDiagram
  ...
```

### Key takeaways from the diagram

- [key insight 1]
- [key insight 2]

## Related notes
Links to entities, scenarios, ADRs.
```

**Important:** the diagram must not be the only source of information. Always keep explanatory text next to the diagram.

## Working with Current and Future

When you add a new idea:

1. Do not put it straight into `Current`.
2. Create a future candidate.
3. Set a trigger.
4. Link it to current entities and scenarios.
5. Create an ADR candidate if needed.

When you accept an idea:

1. Create or update an ADR.
2. Move the note from `Future` to `Current`.
3. Update related diagrams.
4. Update entity notes.
5. Update scenario notes.
6. Archive old versions if they are no longer current (leave a tombstone, see Status separation).

## Supersession and partial supersession

A binary `Superseded` status is not enough. On a real vault, a new decision often
replaces only **part** of an old one — the storage model changes but the semantics
stay, or the physical representation moves while the logical contract holds. If the
old ADR keeps `Status: Accepted` and reads as whole truth, the next reader implements
a model that no longer exists. This is the single most dangerous decay mode of a
mature spec.

Rules when a new ADR replaces an older one:

1. **Both notes get updated, not just the new one.** The new ADR lists what it
   `Supersedes`; the old ADR lists what it is `Superseded by` and **which part**.
2. **If only part is replaced**, set the old ADR's status to
   `Accepted (partially superseded)` and pin a banner at the top naming the new ADR
   and the exact scope of the change.
3. **If the whole decision is replaced**, set `Superseded`, add a tombstone, and move
   it to `Archive`.
4. **Never leave a one-directional pointer.** `Supersedes` on the new ADR without
   `Superseded by` on the old one is a defect — backlinks must resolve both ways.

The same applies to entities and scenarios: when a new model replaces an old one in
part, mark the scope, don't silently leave the old note looking current.

## Working with Mermaid

Keep Mermaid code clean and ready to render.

Keep text notes about a diagram outside the Mermaid block, in the Obsidian note itself.

If you need a visible note on the diagram, add it as a separate node inside Mermaid, but do not overuse this. Keep the main explanations as text around the diagram.

## Spec quality

A good spec lets you answer fast:

- which entities exist in the current version;
- which entities are deferred;
- which scenarios are covered;
- which scenarios are not yet covered;
- which decisions are made;
- which decisions are candidates;
- which questions are open;
- which diagrams explain the system;
- which future ideas have a clear trigger;
- what to change for the next stage.

## Naming conventions

Pick one convention and hold it — drift is what produces duplicate and orphan notes.

- **Folders**: Title Case with spaces — `User Scenarios/`, `Entity Candidates/`,
  `Architecture Ideas/`. Not `user-scenarios/`, not `entity_candidates/`.
- **Index notes**: exactly one per folder, prefixed `00 ` — `00 ADR Index.md`.
- **ADR files**: `ADR-NNN Short Title.md` with a zero-padded number.
- **Wikilinks to ADRs**: link the full note name, `[[ADR-024 Plan stored as ...]]`,
  not the bare `[[ADR-024]]`. Bare links rely on Obsidian fuzzy-match and break in
  plain Markdown renderers (GitHub, Confluence).
- **Link by short name, not path**: write `[[KnowledgeUnit]]`, not
  `[[../Entities/KnowledgeUnit]]`. Set Obsidian's "New link format" to *Shortest
  path when possible*. Path links break when a note moves, clutter the graph, and
  defeat backlink matching. Keep note names unique so short links stay unambiguous.
  (This is the Obsidian default; for GitHub/Confluence rendering, use relative Markdown
  links instead — see *Rendering outside Obsidian* below.)
- **Glossary invariant**: every entity in `Current/Entities/` must have a matching
  term in `02 Glossary.md`. The glossary is the ubiquitous language — an entity that
  is not in it is vocabulary that drifts.

## Rendering outside Obsidian (GitHub, Confluence)

The link rules above default to short-name `[[wikilinks]]`, tuned for Obsidian:
rename-aware links, graph view, backlinks. But wikilinks do not render in plain Markdown
viewers (GitHub, Confluence) — they show as literal `[[Note]]` text.

If the vault must also render there, switch to **relative Markdown links**:

- **Body links**: `[Note Name](relative/path/Note%20Name.md)` — URL-encode spaces
  (`%20`) and `&` (`%26`). These resolve in **both** Obsidian and GitHub.
- **Frontmatter** `related:` wikilinks never become links in a Markdown renderer — keep
  them as plain note names.
- **Mermaid** renders natively on GitHub (fenced `mermaid` code blocks), so diagrams
  need no change — the diagram-first approach survives the move intact.

Trade-off: you lose Obsidian's automatic link rewrite on rename — moving or renaming a
note means fixing inbound links by hand (or re-running a wikilink→relative-path
converter). Pick one link style per vault and hold it; mixing wikilinks and relative
links is the drift this section exists to prevent.

## Invariants (machine-checkable)

These are the rules a validator can enforce. A vault that satisfies all of them is
structurally sound; treat any violation as a defect, not a style preference.

1. Exactly one `00 ` index note per folder; no second/empty index file.
2. No empty (0-byte) notes.
3. Every entity in `Current/Entities/` is referenced by at least one scenario.
4. Every scenario links to at least one entity.
5. Every entity in `Current/Entities/` has a term in `02 Glossary.md`.
6. Every note in `Future/` has a non-empty `## Trigger` and links to at least one
   note in `Current/`.
7. Every ADR has all required sections, including `Revisit trigger` and `Supersession`.
8. Supersession is bidirectional: if ADR-A says `Supersedes B`, then B says
   `Superseded by A` (whole or partial).
9. No wikilink points to a non-existent note (excluding template placeholders).
10. No bare `[[ADR-NNN]]` links, and no path links (`[[../Entities/X]]`) — use the
    short note name. (In GitHub-rendering mode this flips: relative Markdown links are
    the required form — see *Rendering outside Obsidian* — but bare `[[ADR-NNN]]` stays
    forbidden.)
11. No note with `Status: Superseded` / `Rejected` left in `Current/` without a
    tombstone pointer.

## Anti-patterns

Do not:

- keep one huge file for the whole architecture;
- **put diagrams in a separate `Diagrams/` folder** — embed them in the architecture files;
- draw diagrams without explanations;
- define entities without scenarios;
- write scenarios without links to entities;
- leave future ideas without a status or without a concrete trigger;
- make architecture decisions without an ADR;
- supersede an ADR with a one-directional pointer (new note only, old note untouched);
- leave a superseded note in `Current` reading as live truth;
- omit a current entity from the glossary;
- keep a second or empty index note in a folder;
- link ADRs by bare number (`[[ADR-007]]`) instead of the full note name;
- use Mermaid as the only source of meaning;
- treat Obsidian as a plain Markdown folder;
- mix current and future without clear marking;
- duplicate the same information by hand in many places instead of linking.

## Final idea

```text
Scenarios explain why.
Architecture explains how.
Entities explain what.
ADR explains why this way.
Diagrams explain visually.
Future notes preserve what is not current yet.
Obsidian links connect everything.
```
