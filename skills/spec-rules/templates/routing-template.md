---
status: current
summary: "Every address, who decides a move, and how back behaves"
---

# Addresses

## Scope

In this note: the list of addresses, who decides a redirect, the back button, a cold
open by direct link, and the language prefix.

Not in this note: what is on each page, which lives in the screen notes. Not the map
of transitions either, which lives in the journey note.

## Two rules the rest follows

> **Every screen has its own address.**

A screen without an address cannot be left. The phone back button then closes the whole
app, and the work goes with it.

> **The address names the object, not "the current one".**

Otherwise one address points at different data on different days. The bookmark lies,
and a second tab lies as well.

## The test question

> **Does it cover the whole working area?**

Yes means a screen, and a screen needs an address. No means a part of the screen
underneath, and it gets no address.

## The address table

| Screen | Address |
| --- | --- |
| Home | `/` |
| Workspace | `/p/<project>` |
| Item editor | `/p/<project>/item/<item>` |
| Export | `/p/<project>/export` |

`<project>` and `<item>` are the objects' own ids. They are random, not sequential, so
a neighbouring number reaches nobody else's work. They are not positions in a list,
because deleting a neighbour would change every address.

## Who decides a redirect

Say where the data lives, because the answer follows from that. Data on the server
means the server decides. Data in the browser means the client decides.

Name the hint that lets the server route before the first paint, and say what it holds.
An id is enough. No name, no address, no file.

> **Found no work at the address? Clear the hint first, then send the person home.**

Without this rule the server and the browser bounce for ever, and the site stops
opening.

## The back button

> **The arrow in the header is one step back in history, not a fixed link.**

| Pressed back on | Lands on |
| --- | --- |
| Item editor | The workspace, at that item |
| Export | Wherever the person came from |

Name the fallback for an empty history, screen by screen. A bookmark and a reload both
leave nothing to go back to.

## A cold open

| Opened | What shows | Who decides |
| --- | --- | --- |
| A live object | Its screen | — |
| A deleted object | Home, and the address in the bar is replaced | Server |
| An object from another device | Home. The hint is cleared first | Client |
| A deleted child object | The parent screen | Client |

Replace the address in the bar. Otherwise a reload repeats the miss.

A person's own stale link needs no error page. A made-up address gets the shared
not-found page.

## What lives without an address

| What | Why |
| --- | --- |
| A panel that leaves the work visible | It hides nothing |
| A menu in the header | It opened and closed. Nobody returns to it |
| A confirm dialog | The answer is needed now |
| A short undo bar | It lives for about ten seconds |

A third-party overlay has no address, because the screen under it did not change. It
still adds one history entry, so the back button closes the overlay and not the page.

## Reserved names and the language prefix

List the names a shared library will want later, such as sign-in and settings. Leave
them free from the first day.

Give every extra language a prefix, and give the main one no prefix. Every address
above then stays valid.

## What to check

- Every address opens from a bookmark, and shows the right page.
- The back button lands where the table says, on every screen.
- A cold open of a deleted object replaces the address in the bar.
- Clearing the browser storage while the hint stays does not loop.
- A made-up address shows the not-found page.

In a layered vault drop this whole section. The lines live in a check list in
`qa/`, and "Related notes" names that list in one line.

## Related notes

Links to the screen index, the journey note, the cross-screen rules note, and the
entities that own the ids.

## Open questions

What still needs deciding about addresses.
