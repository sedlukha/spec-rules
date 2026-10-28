# The vault check

Two scripts check a spec vault against the invariants in `SKILL.md`. They need
Node 18 or newer and nothing else. No package is installed, so a CI step can run
them before any install.

```bash
node scripts/check-spec.mjs            # the whole vault, the lists in counts
node scripts/check-lists.mjs           # the check lists against the tests
node scripts/check-lists.mjs --all     # every line with no test, and free ids
node scripts/check-lists.mjs CHK       # one list, and five free ids for it
node scripts/fix-spec.mjs              # rewrite notes for the merge rules
```

Run them from the repo root. The skill is often installed under
`.claude/skills/spec-rules/`, so a `package.json` script reads like this:

```json
"check:spec": "node .claude/skills/spec-rules/scripts/check-spec.mjs"
```

Both scripts exit with 1 when they find a problem, and with 2 when the config is
wrong. Each problem ends with the id of its rule in brackets, such as
`[retired]`.

## The rules live here, the data lives in the vault's repo

A vault has its own data: its layers, its retired names, its own language. That
data never goes into these scripts. It goes into `spec-rules.config.mjs` at the
root of the vault's repo. Another path works with `--config <file>`.

The file is a JavaScript module, so a pattern is a real regular expression.
It imports nothing, so plain `node` can load it. Start from
[`spec-rules.config.example.mjs`](spec-rules.config.example.mjs).

With no config file the scripts use the defaults: repo mode, the vault in
`docs/spec`, no layers. `--vault <dir>` changes the folder.

**A key the scripts do not know is an error.** A typo in a key never turns a
rule off without a word.

**Where a path points.** A path to a note or a note folder is relative to the
vault, like a link: `../backlog`. A path to code is relative to the repo root.

## The rules

| Rule id | What fails | Invariant in `SKILL.md` |
| --- | --- | --- |
| `empty-note` | A note with no text | 2 |
| `links` | A link that resolves to nothing, in the vault and in `frozen` folders | 10 |
| `link-style` | A wikilink in a Markdown vault, or the other way round. A link to a decision by its bare number | 11 |
| `header` | No header. A `status` or a `decision_status` outside its list. A field from `goneFields` | 21 |
| `summary` | No `summary`, or one longer than `summaryWords` | 3 |
| `summary-forbidden` | A `summary` that matches a pattern of `summaryForbidden` | — |
| `forbidden-heading` | A heading that matches a pattern of `forbiddenHeadings` | — |
| `open-questions` | A note's own open questions section that neither links nor matches `none` | Open questions |
| `retired` | A retired thing named in a paragraph with no link to a note that explains its absence | — |
| `layers` | A note outside the `layers`, other than `rootNotes` at the root | 20 |
| `index` | Two index notes in one folder. With `requireIndex`, a folder with none | 1 |
| `decision-number` | One decision id on two notes. In slug mode also a file not named `ADR-<slug>.md`, and a slug from the `decisions.retired` table | 22 |
| `decision-refs` | Slug mode only. A word of `decisions.words` before a slug that no decision note has, in a note or in code | 22 |
| `future` | A deferred idea with no trigger, or with no link to a live note | 7 |
| `statements` | One bold statement of `minWords` or more in two notes | Anti-patterns |
| `pointers` | A pointer from code to the vault that names no place in it | — |
| `lists` | A check list outside its folder, a line with no id, an id used twice, a tag that names no line or stands where no test reads it | 23 |
| `tables` | With `tables: "forbidden"`, a table in a live note | Merge clean |
| `sorted` | A list in a note of `sorted.notes` whose heads are out of order | Merge clean |
| `decision-index` | With `decisionIndex: true`, an index whose generated list differs from the decision notes | Merge clean |

A dash means the rule comes from a vault, not from the skill. Its data starts
empty, so it fails nothing until a vault fills it. The three merge rules start
off too.

Turn a rule off with `rules: { "retired": false }`. Turn a whole group off with
`null`, such as `lists: null`.

Templates are not notes. No rule reads a folder named in `templates`.

## What the scripts do not check

Some invariants need judgement about a note's meaning, or depend on the shape of
one vault. The scripts leave these to a reader: 4, 5, 6, 8, 9, 12 to 19, and 24.

## Three rules that need a word

**`retired`.** A decision takes something away, and its name lives on in other
notes. Each entry holds a pattern and the notes that explain the absence. The
paragraph that names the thing must link one of those notes. A table counts as
one paragraph, so a row carries its own link. A list item with its sub-items
is one paragraph too. The header is skipped: no
renderer turns a field into a link.

Spell out every letter class in a pattern. In JavaScript `\w` and `\b` know only
Latin letters, so `\w+` never matches a word in another alphabet.

**`statements`.** A rule in a vault is almost always bold. So the script
collects every bold phrase of `minWords` words or more and compares them across
notes. Case, punctuation and line breaks do not count. Some wording repeats on
purpose, such as the name of a rule. Put it in `repeatsOnPurpose` with its
reason. An entry that matches nothing fails the run too, because it reads as a
decision and holds none.

**`pointers`.** Code may point at the vault like this:

```ts
// See `docs/spec` → Checkout → The price is shown once.
```

Each step after an arrow must name a place inside the step before it. A name is
a note, a folder, a heading, a bold statement, the first cell of a table row, a
check line id, or the words of a link to a note. A decision is named by its
number, such as `ADR-042`, or by its slug in slug mode, such as
`ADR-head-only`. The marker is the vault path in backticks.

**`decision-refs`.** A vault of slugs is checked wider than a pointer. Each
word of `decisions.words` before a slug names a decision: `decision head-only`,
or `decisions head-only and tile-is-photo`. Every note and every code file is
read. A slug that no decision note has fails. So a merged decision leaves no
stale name behind. A capital letter starts prose, not a slug, so
`Decision Next-Step` is not read.

## The merge rules, and the script that fixes them

Each merge rule has a fix. `fix-spec.mjs` rewrites the notes, and you read the
diff before you commit. A second run changes nothing.

**`tables`.** The fix turns each table into a list. The first cell of a row
becomes the head of an item, in bold. Each other cell becomes a sub-item that
starts with the name of its column. An empty cell is dropped. One blank line
stands between two items. Two tables with only a blank line between them would
become one list. So the second list opens with a line that names its first
column, such as `Rule:`. A table with no rows leaves nothing. A bold head alone on its line is a name, so the
`statements` rule does not read it.

**`sorted`.** The fix puts every list of the note in the order of its heads.
`sorted.locale` sets the alphabet, such as `"en"` or `"ru"`. An item moves with
all its lines.

**`decision-index`.** The index of a folder of decisions holds two marker lines:

```markdown
<!-- decision-index -->
<!-- /decision-index -->
```

The fix writes one item per decision between them: the title from the `#`
heading, a link, and the `summary`. The items go in the order of the file
names. An index with no markers gets them at its end.

**After a merge conflict in such a note,** take either side. Then run the fix
and commit what it writes.

## The check lists

A note is a check list when its header holds `checks: CHK`. Every line of the
list starts with an id, such as `` - `CHK-k3f9` ``. A test that closes the line
carries `@CHK-k3f9` in its name. A story carries it in `parameters.checks`.

Never make an id up. `check-lists.mjs CHK` prints five free ones. An id is
drawn at random, so two branches almost never take the same one.

A line with no test does not fail the run. The scripts count such lines per
list, because a spec often runs ahead of the code.
