---
name: spec-rules
description: "Keep the spec next to the code. One CLAUDE.md per package that owns a part, reasons in code comments, numbers in constants, and a short product spec for people. Use when you write, move or cut a rule, a reason, a rejected way or a rule of absence. Also use when you edit a CLAUDE.md that describes a part of the product, or touch a docs/spec folder."
allowed-tools: Read, Glob, Grep, Edit, Write, AskUserQuestion
---

# spec-rules: the spec lives next to the code

## Core principle

The code is the truth for what the product does. The spec says why, and what
we chose not to do. So it lives as close to the code as it can.

| What | Where it lives |
| --- | --- |
| A reason for one place in the code | A comment at that place |
| A number | A named constant. Its reason sits in a comment at the constant |
| A rule that spans several files of one part | The `CLAUDE.md` of the package that owns the part |
| What the product is, for whom, its main paths, its words | A short product spec for people, in `docs/spec` |
| A bug, a plan, an open question | An issue |

**Why not a vault of small linked notes.** Such a spec retold the code, so a
large share of it went stale. Its notes pointed at each other in long chains.
An agent spent its context on them and found little it could not read in the
code. A `CLAUDE.md` in the package folder reaches the agent by itself: Claude
Code loads it when it works in that folder.

## One `CLAUDE.md` per part

- **One file per package or folder that owns a part.** Not one per source file.
- **No `AGENTS.md` beside it.** Write straight into `CLAUDE.md`. Claude Code
  loads a nested `CLAUDE.md`, and it does not load a nested `AGENTS.md`.
- **The root `AGENTS.md` stays.** A root `CLAUDE.md` imports it with
  `@AGENTS.md`, so other tools read the same text.

### The shape

- An H1 that names the part.
- A short opening. It says what the part is. It says that a one-place reason
  lives in a comment there.
- A table "part → code" when it saves a search. Keep it short.
- One section per area. Each rule is a bold lead sentence, then its reason.

### What goes in

Only three kinds of text:

- **A rule that spans several files, with its reason.** One file alone cannot
  hold it, so a comment is the wrong home.
- **A rejected way.** "We turned down X, because Y." The code cannot show a road
  it did not take. Without the line, the next person tries X again.
- **A rule of absence.** "The screen has no X, because Y." Nothing in the code
  can hold a comment for a thing that is not there.

### What stays out

- **A retelling of the code.** The reader sees it in the code.
- **A list of files that `ls` shows.** A short map table is the one exception.
- **A reason for one place.** It goes in a comment at that place.
- **A value.** Name the constant, never the number.
- **A bug, a plan, a story or an issue number.** See below.
- **A copy of a rule from another `CLAUDE.md`.** Link to it instead.

## One fact lives in one file

Another file links to the fact and never copies it. A copy goes stale first,
and then two files disagree.

Before you write a rule, look for it:

```bash
git ls-files '*CLAUDE.md'
git grep -n "<a word of the rule>" -- '*CLAUDE.md'
```

**A rule shared by two parts goes to their common owner.** That is a shared
package both parts use, or the nearest folder above both. Each part then links
to it.

## A comment holds the one-place reason

- **No length limit.** Take the room the reason needs. Cut every word that
  adds nothing.
- **One idea per comment, in the present tense.** Say how the code works now.
- **The reason and the rejected way of that place.** Not a retelling of the
  next line.
- **A measure may back a reason.** Keep its date and its numbers. The story of
  the debug session goes.

## A pointer names a heading or a symbol

A comment points at a `CLAUDE.md` heading, or at a symbol. A heading and a
symbol survive a move of the file.

```ts
// see `packages/cart-page/CLAUDE.md` → The item list
// see `ROW_GAP`
// see `fitRow` in `lib/row-fit.ts`
```

- **The heading text is exact.** The text after `→` starts with a real heading
  of that file. Any heading level counts.
- **Point at a file only as a last resort.** Do it when the reader cannot find
  the reason without it.
- **A test does not point at the code it tests.** Its name says what it holds.
  The code already owns the reason.
- **A `CLAUDE.md` names a file with a relative link or a path in backticks.**
- **Check every pointer in the repo's `test` script.** A small script reads
  each comment and each `CLAUDE.md`. It fails when a named file, symbol or
  heading is gone. Then a rename breaks the commit, not the reader.

## A number lives in a constant

- **Put the value in a named constant in the code.**
- **Write its reason in a comment at the constant.** Where it was measured, and
  what a larger or smaller value broke.
- **A `CLAUDE.md` names the constant.** It never repeats the value, so the two
  never drift apart.

## No bugs, plans or history

- **A bug is an issue.** It is not a rule, and it goes away when it is fixed.
- **A plan is an issue.** A spec describes the product as it works today. A
  feature that is not built has no rule.
- **History lives in git.** Never write "we used to" or "this was changed".
  A rejected way is the one form of the past that stays.
- **Never write an issue number in code or in a `CLAUDE.md`.** An issue closes,
  and the sentence around the number still reads as live truth. Name the
  durable thing instead: a heading, a symbol or the plain fact.

## The product spec for people

`docs/spec` may keep a short product spec. It is for people who do not read
code: a product manager, a tester, a marketer.

- **Write it in the language of the team, as plain connected prose.**
- **It holds what the product is and for whom.** Also the main scenarios, what
  is in the release, the words of the product, and the marketing.
- **It holds no code rule and no number the code owns.** Those live in the code
  and in the `CLAUDE.md` files.
- **Code never points into it.** No check guards such a pointer, so it would
  break in silence.
- **An open question is an issue**, never a list in the spec.

## Moving an old spec next to the code

Move one part at a time. The old notes of a part leave in the same pull
request as its new `CLAUDE.md`.

1. **Sort every fact of the old notes.** A rule with a reason, a number, a
   rejected way, a retelling of code, a bug, a bare link, or filler. Find the
   place of each fact in the code, or mark it as not in the code.
2. **Check each mismatch yourself.** Read the code until you are sure. The code
   is the truth. Never change the code to match a note. Open an issue for a
   real mismatch.
3. **Write the `CLAUDE.md` of the part.** Only rules that span several files go
   in. Retellings, bugs, history and filler go away. A rule of absence and a
   rejected way stay, even when no code holds them.
4. **Move each one-place reason into a comment at its symbol.** Change comments
   only. Never change behaviour, names or imports in the same step.
5. **Delete the old notes, and fix every pointer to them.** Look in code, in
   tests, in other `CLAUDE.md` files and in the root `AGENTS.md`.
6. **Run the pointer check.** It reports nothing when you are done.

## The old vault check

`scripts/` still holds the check of an old vault of linked notes:
`check-spec.mjs`, `fix-spec.mjs` and `check-lists.mjs`. A repo calls them while
its old vault exists. Remove the call with the last old note. Every rule and
config key is in `scripts/README.md`. Never write a new note for them.

## Anti-patterns

- A `CLAUDE.md` that retells the code, or lists what `ls` shows.
- Two `CLAUDE.md` files that hold the same rule.
- A chain of pointers: "see X", where X says "see Y".
- A value written in a `CLAUDE.md` instead of a constant name.
- A nested `AGENTS.md`. Claude Code does not load it.
- A comment or a `CLAUDE.md` with an issue number, a bug or a plan.
- A test comment that points at the code the test checks.
- A pointer from code into the product spec.

## Example

An invented part, to show the shape.

```markdown
# The cart page

The cart page lists what a person is about to buy. This file holds the rules
that span several files of the page. A reason that belongs to one place in the
code lives in a comment there.

| Part | Code |
| --- | --- |
| The page and its panel | `packages/cart-page/src/ui` |
| Row sizes | `packages/shared/layout/src/rows.ts` |

## The item list

**One line per item on any window.** The total stays in sight without a
scroll. The row height is `ROW_HEIGHT`.

We turned down:

- A grid of cards. On a phone a person lost the total.
- A sticky total bar. It covered the last item.

## What the cart page never has

- **No countdown.** It pushes a person, and they leave.
- **No coupon field.** A field that most people leave empty makes them search
  for a code.
```
