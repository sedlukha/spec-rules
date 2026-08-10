---
type: screen
status: current
stage: stage-1
tags:
  - screen
  - current
  - stage-1
related: []
---

# Screen Name

## What this screen is for

One or two sentences. Say whether the screen is optional, and how the person reaches
it. Link the scenarios that cross it, and the note that owns its address.

## Why this is a screen

Only when the answer is not obvious. Say why this is a screen with its own address,
and not a panel inside another screen. The test: does it cover the whole working area?

## Narrow layout

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

Numbers in the drawing are examples. The real ones live with their owner.

## Wide layout

Same pieces, different container. Say what moves, and what never changes.

## Parts

| Part | What it does |
| --- | --- |
| Back | Where it returns to |
| The main object | What the person came here to see |
| Settings | Which values, and what they change |
| Main action | One slot. List its states below |

## Rules that hold here

One short section per rule. A table of rule and reason reads best. Link the entity or
the ADR that owns each number. Do not restate the number.

## What is not here

| What is missing | Why |
| --- | --- |
| | |

## What goes wrong

| Case | What happens |
| --- | --- |
| Nothing to show yet | |
| Part of the data is still loading | |
| The object is gone | |

## What to check

- One line per check. A tester writes cases from this list.
- Include the back button, the empty case, and every state of the main action.

## Related notes

Links to entities, scenarios, ADRs, the cross-screen rules note, and the address note.

## Open questions

What still needs deciding on this screen.
