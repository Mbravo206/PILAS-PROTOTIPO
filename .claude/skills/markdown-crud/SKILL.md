---
name: markdown-crud
description: Create, read, update, and delete records stored in a Markdown "database" file that uses the "### ID: <id>" heading + YAML front matter (between --- delimiters) + free-text notes block format — the kind of structured, git-friendly, human-readable data store used to back LLM/RAG/function-calling apps. Use this skill whenever the user wants to add, look up, filter, edit, or remove an entry in a Markdown file shaped this way, even if they don't name the format explicitly — phrases like "add a new user to this file", "update the estado field for USR-002", "delete this record", "find all clients with rol: Premium", "add a client to my clients.md", or a file that visibly contains "### ID:" headings with YAML between "---" lines. Also trigger when the user is designing a Markdown-based data store, mentions "Colección" sections, or wants a lightweight alternative to a real database for an AI-connected app. Always perform the actual create/update/delete through the bundled script (scripts/md_crud.py) instead of hand-editing the file — it guarantees the YAML and neighboring records are never corrupted.
---

# Markdown CRUD

This skill operates on Markdown files used as lightweight, human-readable
"databases" — the kind of file an AI agent reads and writes to persist
records (users, tickets, notes, anything) without a real database. It's
particularly common in RAG or function-calling setups, since each record is
one clean, indexable block.

## The format

```markdown
# BD_Usuarios

## Colección: Clientes

### ID: USR-001
---
nombre: "Carlos Mendoza"
email: "carlos@email.com"
estado: "Activo"
rol: "Premium"
creado_en: "2026-08-23"
---
**Notas del Agente IA:**
El cliente solicitó prioridad en el soporte técnico relacionado con la API de integración.

### ID: USR-002
---
nombre: "Ana Gómez"
estado: "Inactivo"
---
**Notas del Agente IA:**
Cuenta suspendida temporalmente por falta de pago.
```

- Each record is an H3 heading `### ID: <unique-id>`.
- Immediately after it, a YAML front matter block delimited by `---` lines
  holds the structured fields.
- After the closing `---`, free-text notes run until the next `### ID:`
  heading, the next `## ` heading, or the end of the file.
- Records can optionally be grouped under `## Colección: <name>` headings.
  A file may have zero, one, or several collections.

## Why the script, not manual edits

Reading a record with the `Read` tool is fine for a quick look. But for
**any Create, Update, or Delete**, always run `scripts/md_crud.py` instead of
editing the text yourself. The format looks simple, but hand-editing it risks
subtle corruption a script doesn't: an `Edit` that replaces "the YAML block"
by matching text can silently touch the wrong record if two records share a
field value, a manual delete can leave a dangling blank line or eat the next
record's heading, and free-typed YAML can produce a value that fails to
parse later (an unquoted string with a colon in it, for instance). The script
parses the whole file into structured records first, mutates only the one
record being touched, and re-serializes deterministically — so a single
operation can never bleed into a neighboring record.

Run it with the Bash tool. It requires Python 3.10+ and PyYAML (`pip install
pyyaml` if the read/create/update/delete commands report `ModuleNotFoundError:
yaml`).

## Operations

**Read** one record, or list/filter records (omit `--id` to list):

```bash
python scripts/md_crud.py read path/to/file.md --id USR-001
python scripts/md_crud.py read path/to/file.md --collection Clientes
python scripts/md_crud.py read path/to/file.md --filter rol=Premium --filter estado=Activo
```

Output is always JSON — a list of records, each with `id`, `collection`, its
YAML fields spread in, and `notas_ia` for the free-text notes. Use this to
inspect what's in the file before an update, or to answer a lookup question
without printing the raw Markdown.

**Create** a record. Omit `--id` to auto-generate the next one in sequence
(it follows the existing `PREFIX-NNN` pattern in that collection, or falls
back to `REC-001`):

```bash
python scripts/md_crud.py create path/to/file.md \
  --collection Clientes \
  --field nombre="Carlos Mendoza" --field email=carlos@email.com --field estado=Activo \
  --notes "**Notas del Agente IA:**
El cliente solicitó prioridad en el soporte técnico."
```

If the file doesn't exist yet, this creates it. Pass `--title` to give the
new file an H1 heading, and `--collection` to open its first collection
section.

**Update** one or more fields and/or the notes of an existing record. Only
the fields you pass with `--field` change — everything else in the record is
left untouched:

```bash
python scripts/md_crud.py update path/to/file.md --id USR-002 --field estado=Activo
python scripts/md_crud.py update path/to/file.md --id USR-002 --notes "Reactivada el 2026-08-23." --notes-mode append
```

**Delete** a record — removes its full block, from its `### ID:` heading up
to (not including) the next heading:

```bash
python scripts/md_crud.py delete path/to/file.md --id USR-002
```

**`--dry-run`** (available on create/update/delete) prints the resulting file
content instead of writing it — use it to preview a risky change before
committing to it, e.g. a delete on a file you haven't inspected yet.

## Working with the user's request

1. If the user's request implies looking something up or checking what's
   there, `read` first — don't guess at IDs or field names from the prompt
   alone.
2. Map the user's request onto fields the file already uses. If they say
   "mark Ana as inactive" and the file's YAML key is `estado`, call
   `update --field estado=Inactivo` — don't invent a differently-named field.
3. For values with spaces, punctuation, or that look like YAML (`true`,
   `123`, `null`, a colon), quote appropriately at the shell level; the
   script parses each field value as YAML, so `--field precio=19.99` becomes
   a number and `--field nombre="Ana Gómez"` stays a string.
4. When creating a record for a user who gave partial data ("add a client
   named Ana"), only set the fields they gave you — don't invent placeholder
   values for fields you don't have.
5. If a `read`, `update`, or `delete` fails because the ID doesn't exist,
   don't guess — show the user what IDs *do* exist (`read` with no `--id`)
   and ask, unless the intent is unambiguous from context.
6. After a create/update/delete, briefly tell the user what changed (which
   ID, which fields) rather than dumping the whole file back at them.
