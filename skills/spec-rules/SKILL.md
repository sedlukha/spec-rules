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
- screens;
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
- which screens exist, and which scenario reaches each one;
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
#screen
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

Create and use note templates. This package ships nine in `templates/`:

- Entity template;
- User Scenario template;
- Screen template;
- ADR template;
- Diagram template;
- Future Candidate template;
- Open Questions template (the current note);
- Deferred Questions template (the future note);
- Routing template (the address note).

Optional, not shipped (add a template file before referencing): Glossary Term,
Pipeline / Process.

### 8. Index / MOC notes

Use MOC (Map of Content) notes. One index per folder, always named with the
`00 ` prefix so it sorts to the top and there is exactly one index per folder:

- `00 Home`
- `00 Current Index`
- `00 Future Index`
- `00 Architecture Index`
- `00 Entity Index`
- `00 Scenario Index`
- `00 Screen Index`
- `00 ADR Index`
- `00 Diagram Index`

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

Open questions carry a status too, so they split the same way. See
[Open questions: two notes, not one list](#open-questions-two-notes-not-one-list).

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

  Current/
    00 Current Index.md
    Open Questions.md                 (questions this cycle answers)

    Architecture/
      00 Architecture Index.md
      Core Flow.md                      (holds a flow diagram)
      Core Domain Model.md
      Data Model.md                     (holds an ER diagram)
      Process Model.md                  (holds a pipeline diagram)
      Lifecycle Model.md                (holds a state diagram)
      Screen Rules.md                   (rules that cross screens)
      Routing.md                        (holds the address table)

    Entities/
      00 Entity Index.md

    User Scenarios/
      00 User Scenarios Index.md

    Screens/
      00 Screen Index.md

    ADR/
      00 ADR Index.md

  Future/
    00 Future Index.md
    Deferred Questions.md             (questions whose answer comes later)

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
    Open Questions Template.md
    Deferred Questions Template.md
    Screen Template.md
    Routing Template.md
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

## Screens: place, not time

A vault with scenarios needs screen notes as well. The two folders look alike and are
not alike. Mix them, and the same sentence lands in two notes. One copy then goes
stale, and the reader has to guess which one is true.

> **A scenario is time. A screen is place.**

| | Scenario | Screen |
| --- | --- | --- |
| Question | What does the person do, in what order | What is on this page |
| Words | Verbs | Nouns |
| Test word | "then" | "here" |
| Reach | Crosses screens | One screen |

Wrote "then he presses save"? That is a scenario. Wrote "here is a save button"? That
is a screen.

### Where a failure sentence goes

Failures are the slippery part, because both notes have a claim on them. Split every
failure in two.

- The scenario owns **what happened**: the file did not open, the item turns to a
  failed state, and the queue keeps going.
- The screen owns **how it looks here**: the tile is dim and reddish, and it carries
  one remove button.

### A screen note restates no number

Numbers and reasons live in entities and ADRs. The screen note links to them, and it
never copies the value. Otherwise one number sits in five notes, and four of them go
wrong.

A mock-up may show a number. Say next to the mock-up that the number is an example.

### Every screen is named by a scenario

Two rules, and they run in both directions.

- Every screen note is named by at least one scenario.
- Every scenario lists the screens it crosses, under one fixed heading.

A screen that no scenario reaches is dead work, or a missing scenario. Both cases need
an answer before anyone builds it.

### Never create a placeholder screen note

An empty screen note reads as decided, and that is a lie. A screen gets a note when it
is thought through. Until then it is one line in the index.

### Rules that cross screens live in one architecture note

A rule that holds everywhere belongs to no single screen. Copy it into each screen note
and it drifts. Keep it in one architecture note, and let every screen note link there.

Typical residents: the header and the footer, the loading and empty states, the undo
bar, the accessibility rules, and the interface copy.

### The screen index lists four groups, not one

An index that lists only the finished screens hides the useful part.

| Group | What it holds |
| --- | --- |
| Thought through | Screens with their own note |
| Drawn by somebody else | A third-party form, or a page from a shared library |
| Deferred | Screens in `Future/`, each with its trigger |
| Never | Screens that will not exist, each with the reason |

The last group earns its place. "No price screen, because the button already names the
price" answers the same proposal three times a year.

### One slot with several states beats a new screen

A new state is not a new screen. Draw the slot once, then list its states in a table.

The main action is the common case. Free, priced, running, and paid can share one
button. Every state you turn into a screen needs its own address, its own back button,
and its own test.

### Draw the screen with plain characters

A box drawing inside a fenced block renders everywhere, and it needs no image file. It
also forces the note to name the pieces in order.

```text
┌──────────────────────────────┐
│ ←   Screen name              │
├──────────────────────────────┤
│    [ the main object ]       │
├──────────────────────────────┤
│  Setting   [ value ▾ ]       │
│  Setting   ━━●━━━  70        │
├──────────────────────────────┤
│  [       Main action       ] │
└──────────────────────────────┘
```

Keep the drawing small. It shows the order and the weight of the pieces. It is not the
final design.

### Layouts: same pieces, different container

Write one note per screen, never one note per device. A narrow and a wide layout hold
the same pieces in a different container.

Say what moves. A row of settings becomes a side column. A grid gets more columns. The
purpose of the screen never changes with the window.

Pick the layout by window shape, not by device name. A phone held sideways is a wide
window with almost no height.

### A screen note ends with three lists

| List | What it prevents |
| --- | --- |
| What is not here, and why | The control you removed returns next quarter |
| What goes wrong | The empty, partial, and broken cases stay unwritten |
| What to check | A tester cannot write cases from the note |

The last list is the point of the whole note. A manager must understand every screen
note. A tester must be able to write test cases from it.

## One note owns the addresses

Screens need addresses, and addresses need one owner. Give the vault a single
architecture note for them, `Current/Architecture/Routing.md`.

Its scope is narrow on purpose.

| In this note | Somewhere else |
| --- | --- |
| The list of addresses | What is on each page, in the screen note |
| Who decides a redirect | The map of transitions, in the journey note |
| The back button | Layout, copy, and parts |
| A cold open by direct link | |
| The language prefix | |

### Every screen has its own address

A screen without an address cannot be left. The phone back button then closes the
whole app, and the person's work goes with it.

So the address table and the screen index must match, row for row. A screen with no
row is a defect in one of the two notes.

### The test question: does it cover the work?

Not everything that opens on top is a screen.

> **Does it cover the whole working area?**

Yes means a screen, and a screen needs an address. No means a part of the screen
underneath, and it gets no address.

Ask this before you write either note. The answer moves panels into screens, and
screens back into panels.

### The address names the object, not "the current one"

An address that means "the project I opened last" points at different data on
different days. The bookmark then lies, and a second tab lies as well.

| Rule | Why |
| --- | --- |
| Put the object id in the address, even while there is only one object | Then nothing has to move when the second one arrives |
| Use the object's own id, never its position in a list | Deleting a neighbour would change every address |
| Make the id random, not sequential | A neighbouring number must not reach somebody else's work |

An example shape: `/p/<project>`, `/p/<project>/item/<item>`, `/p/<project>/export`.

### Who decides a redirect: the server or the client

This is the hardest part of the note, and the answer depends on one thing. Where does
the data live?

Data on the server means the server decides. Data in the browser means the server
knows nothing about it, so the client decides.

A returning person must not see the wrong page, not even for one frame. So the
decision has to happen before the first paint. A small hint, such as a cookie with
the last object id, lets the server route without reading the work itself.

**The hint holds an id and nothing else.** No name, no address, no file.

#### The redirect loop, and the rule that prevents it

The hint and the work live in two places, so they can die apart. A browser clears the
storage of a rarely used site on its own. Then the hint says "go to the project", and
the browser says "there is no project".

> **Found no work at the address? Clear the hint first, then send the person home.**

Without this rule the two sides bounce for ever, and the site stops opening at all.
Write the rule down, because the code will be written by somebody who never saw the
loop.

### The back button is a step in history

> **The arrow in the header is one step back in history, not a fixed link.**

A screen reached from two places then returns to the right one, and it needs no second
address.

| Pressed back on | Lands on |
| --- | --- |
| Item editor | The workspace, at that item |
| Export | Wherever the person came from |

**There may be no history at all.** A bookmark or a reload leaves nothing to go back
to. Name the fallback for every such screen, or the arrow throws the person off the
site.

### A cold open needs a row for every address

Any address can open from nothing: a bookmark, a reload, a link one year old. The
object may be gone.

| Opened | What shows | Who decides |
| --- | --- | --- |
| A live object | Its screen | — |
| A deleted object | Home, and the address in the bar is replaced | Server |
| An object from another device | Home. The hint is cleared first | Client |
| A deleted child object | The parent screen | Client |

**Replace the address in the bar.** Otherwise a reload repeats the miss, and the back
button returns to the same dead address.

A person's own stale link needs no error page. They did not type it, and their work
waits one step away. A made-up address is a different case, and it gets the shared
not-found page.

### What lives without an address

| What | Why |
| --- | --- |
| A panel that leaves the work visible | It hides nothing |
| A menu in the header | It opened and closed. Nobody returns to it |
| A confirm dialog | The answer is needed now |
| A short undo bar | It lives for about ten seconds |

**A third-party overlay is the tricky one.** A payment form drawn by somebody else has
no address, because the screen under it did not change. But the phone back button must
close the form, not the page. So opening it adds one history entry, and closing it
takes that entry away.

A history entry is not an address. The bar does not change, and the link cannot reopen
the form.

### Names you do not take

A shared library may bring its own pages later: sign-in, settings, a public profile.
Leave those names free from the first day. Then the library arrives, and no address of
yours has to move.

### The language prefix

Decide the shape now, even with one language. Give every extra language a prefix, and
give the main one no prefix. Every address in the table then stays valid when the
second language lands.

### A client-only flag stays client-only

A query flag that only the browser reads must never be read on the server. Read it
there, and the page loses its pre-render for everybody. The cost falls on every
visitor, for a flag that is off in production.

### End the note with a check list

The address note is testable, so give the tester lines to run.

- Every address opens from a bookmark, and shows the right page.
- The back button lands where the table says, on every screen.
- A cold open of a deleted object replaces the address in the bar.
- Clearing the browser storage while the hint stays does not loop.
- A made-up address shows the not-found page.

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

### Screen note

```text
# Screen Name

## What this screen is for
Why the page exists. Whether it is optional. How the person reaches it.

## Why this is a screen
Only when the answer is not obvious. Why it is not a panel inside another screen.

## Narrow layout
A small box drawing.

## Wide layout
Same pieces, different container. What moves, and what never changes.

## Parts
A table: part, and what it does.

## Rules that hold here
One short section per rule. Link the entity or the ADR that owns each number.

## What is not here
A table: what is missing, and why.

## What goes wrong
A table: case, and what happens.

## What to check
One line per check. A tester writes cases from this list.

## Related notes
Links to entities, scenarios, ADRs, and the address note.

## Open questions
What still needs deciding on this screen.
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

### Open questions note

Two notes share one shape. `Current/Open Questions.md` holds the questions this cycle
answers. `Future/Deferred Questions.md` holds the rest, and it adds a signals table at
the top.

```text
# Open Questions

Only questions with no answer yet.
A solved question is deleted whole, because the answer lives in the decision note.

## Signals                          (deferred note only)
One row per question: the exact signal that brings the answer.

## The question, written as a question

What is already decided, and which data already exists.

**Question.** The one thing nobody knows yet.

**Delays.** What waits for the answer. Write "Nothing" when nothing waits,
and name what stands in place of the answer.
```

### Routing note

One architecture note, and it owns every address.

```text
# Addresses

## Scope
What this note owns, and what lives in the screen and journey notes.

## The rules the rest follows
Every screen has an address. The address names the object, not "the current one".

## The test question
Does it cover the whole working area? Yes means a screen, so it needs an address.

## The address table
A table: screen, and address. One row per screen, and no row without a screen.

## Who decides a redirect
The server or the client, and why. The hint, and the rule that clears it first.

## The back button
A table: pressed back on, and lands on. Plus the fallback when history is empty.

## A cold open
A table: address opened from nothing, what shows, and who decides.

## What lives without an address
A table: panels, menus, dialogs, and a third-party overlay.

## Reserved names and the language prefix
Names a shared library will want later. The prefix shape for a second language.

## What to check
One line per check, all of them testable from a bookmark.
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

## Open questions: two notes, not one list

An open question has a status, exactly like an entity or an idea. So open questions
live in two notes:

- `Current/Open Questions.md` — questions this cycle answers;
- `Future/Deferred Questions.md` — questions whose answer comes later.

One shared list looks tidy and reads badly. A release blocker sits next to a question
nobody will read for a year. The reader cannot tell them apart. The page then grows
into a wall of text, and people stop using it.

### The sorting test is not "does it block?"

On a mature vault almost no question blocks work. The spec already has something in
place of every missing answer. A calculated number, a rough number, or a rule that
holds anyway. Sort by "does it block?" and nearly every question ends in one group.

Ask this instead: **will anyone work on this question before the release?** Two
reasons move a question to the deferred note.

1. The answer only arrives after the release. It needs real users, real hardware, or
   a complaint from a real person.
2. The question is not about the current scope at all.

A question that blocks work stays in the current note. Name the block in the question
itself, so nobody has to guess.

### Every question says what it delays

Every question ends with one line: what waits for the answer. Write `Nothing` when
nothing waits, and name what stands in place of the answer.

Do not keep a separate list of delayed work, and do not count the questions. A second
list always drifts from the first one.

### Every deferred question names its signal

The `Future/` folder asks every idea for a trigger. A deferred question owes the same
thing: the exact signal that brings the answer. Keep the signals in one table at the
top of the note, one row per question.

A deferred question without a signal is a question nobody reopens.

### Moving a question is not answering it

Move the section as it is. A move changes the status, not the content. If the text
needs a rewrite, that is a separate edit with its own reason.

**A solved question is deleted from either note, not ticked.** The answer belongs in
the decision note. A page of ticked questions is an archive, and people stop searching
in it.

### Give a question no number

`Open question 4` breaks the day question 3 gets an answer. Link a question by its own
words instead. Then deleting one question breaks no reference to another.

### Splitting an existing list costs one link sweep

Every inbound link to the old page points at one question inside it, not at the page.
So the split means visiting each link and sending it to the right note. Count those
links before you start, and check every link again afterwards.

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
- which screens exist, and which scenario names each one;
- which screens will never exist, and why;
- which address opens which screen, and who decides a redirect;
- which decisions are made;
- which decisions are candidates;
- which questions are open, and which of them this cycle answers;
- which deferred question waits for which signal;
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
12. Every question in `Future/Deferred Questions.md` has a row in the signals table.
13. No numbered question heading (`Q3`, `Open question 4`) in either questions note.
14. Every note in `Current/Screens/` is named by at least one scenario, and every
    scenario lists the screens it crosses.
15. Every screen note has a parts table and a check list. A note without them is a
    placeholder.
16. No screen note holds a number that an entity or an ADR owns.
17. Every screen note has a row in the address table, and every row in that table
    names a screen note.
18. No two screens share one address.

## Anti-patterns

Do not:

- keep one huge file for the whole architecture;
- **put diagrams in a separate `Diagrams/` folder** — embed them in the architecture files;
- draw diagrams without explanations;
- define entities without scenarios;
- write scenarios without links to entities;
- write the same sentence in a scenario note and in a screen note;
- create a placeholder screen note for a screen nobody has thought through;
- copy a cross-screen rule into every screen note;
- give a state its own screen where one slot with several states would do;
- give two screens one address, or a screen no address at all;
- write an address that means "the object opened last";
- keep a routing hint that can outlive the work it points at;
- leave future ideas without a status or without a concrete trigger;
- keep every open question in one list, so a release blocker sits next to a question
  nobody will read for a year;
- leave a deferred question without the signal that will answer it;
- mark a question solved with a tick instead of deleting it;
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
