---
status: current
checks: CHK
summary: "Check list for one part of the product, one line per check"
---

# Part of the Product: what to check

Checks the note [Part of the product](../design/screens/part-of-the-product.md).

This list lives in `qa/`, one list per part of the product. The `checks` field
holds the id prefix of its lines. A script finds the list by that field.

A line says what must be true. It gives no reason. The reason lives with the
owner of the rule, and the line links to it.

## First part of the screen

Rules of this part in code: [Code note](../code/code-note.md).
Write this line only when the part has a second owner in `code/`.

- `CHK-a1b2` One thing that must be true, and how to see it.
- `CHK-c3d4` A number from its owner, such as a 44 point tap target. Link the owner.

## Second part of the screen

- `CHK-e5f6` One line per check. A test names the id it closes.

## Related notes

Links to the note it checks, and to the note that says how lists are read.
