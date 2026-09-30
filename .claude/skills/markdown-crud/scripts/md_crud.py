#!/usr/bin/env python3
"""
md_crud.py — deterministic CRUD operations on a Markdown "record database".

Format this script understands (see SKILL.md for the full spec):

    ### ID: <unique-id>
    ---
    <YAML front matter>
    ---
    <free-text notes>

Records may optionally be grouped under "## Colección: <name>" headings.

The script parses the whole file into structured records, mutates only the
one record being touched, and re-serializes deterministically. That means a
single CRUD call can never corrupt a neighboring record, the YAML block, or
the rest of the file the way a hand-edited text replacement could.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

import yaml

# Force UTF-8 stdout regardless of the host console's codepage — without
# this, accented/non-ASCII characters (é, ñ, ó...) print as mojibake on
# Windows even though the file itself is read/written correctly as UTF-8.
try:
    sys.stdout.reconfigure(encoding="utf-8")
except AttributeError:
    pass

RECORD_RE = re.compile(
    r"^### ID:[ \t]*(?P<id>\S+)[ \t]*\n"
    r"---\n"
    r"(?P<yaml>.*?)\n"
    r"---\n"
    r"(?P<notes>.*?)"
    r"(?=\n### ID:|\n## |\Z)",
    re.DOTALL | re.MULTILINE,
)

COLLECTION_RE = re.compile(r"^##[ \t]+Colecci[oó]n:[ \t]*(?P<name>.+?)[ \t]*$", re.MULTILINE)


class RecordNotFound(Exception):
    pass


class DuplicateId(Exception):
    pass


def read_file(path: Path) -> str:
    if not path.exists():
        return ""
    return path.read_text(encoding="utf-8")


def write_file(path: Path, content: str) -> None:
    if not content.endswith("\n"):
        content += "\n"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def collection_for_position(content: str, pos: int) -> str | None:
    current = None
    for m in COLLECTION_RE.finditer(content):
        if m.start() < pos:
            current = m.group("name")
        else:
            break
    return current


def parse_records(content: str) -> list[dict]:
    records = []
    for m in RECORD_RE.finditer(content):
        try:
            data = yaml.safe_load(m.group("yaml")) or {}
        except yaml.YAMLError as e:
            raise ValueError(f"Invalid YAML in record {m.group('id')}: {e}") from e
        records.append(
            {
                "id": m.group("id"),
                "fields": data,
                "notes": m.group("notes").strip("\n"),
                "collection": collection_for_position(content, m.start()),
                "start": m.start(),
                "end": m.end(),
            }
        )
    return records


def find_record(content: str, record_id: str) -> dict:
    for r in parse_records(content):
        if r["id"] == record_id:
            return r
    raise RecordNotFound(record_id)


def render_block(record_id: str, fields: dict, notes: str) -> str:
    yaml_str = yaml.safe_dump(
        fields, allow_unicode=True, sort_keys=False, default_flow_style=False
    ).strip()
    notes = notes.strip("\n")
    block = f"### ID: {record_id}\n---\n{yaml_str}\n---\n"
    if notes:
        block += f"{notes}\n"
    return block


def parse_value(raw: str):
    try:
        return yaml.safe_load(raw)
    except yaml.YAMLError:
        return raw


def parse_field_args(pairs: list[str]) -> dict:
    fields = {}
    for pair in pairs:
        if "=" not in pair:
            raise ValueError(f"--field must be KEY=VALUE, got: {pair!r}")
        key, raw = pair.split("=", 1)
        fields[key.strip()] = parse_value(raw)
    return fields


def next_id(content: str, collection: str | None) -> str:
    records = parse_records(content)
    scoped = [r for r in records if collection is None or r["collection"] == collection]
    pool = scoped or records
    pattern = re.compile(r"^([A-Za-z]+)-(\d+)$")
    best_prefix, best_num = None, 0
    for r in pool:
        m = pattern.match(r["id"])
        if m:
            prefix, num = m.group(1), int(m.group(2))
            if best_prefix is None or prefix == best_prefix:
                best_prefix = prefix
                best_num = max(best_num, num)
    if best_prefix:
        return f"{best_prefix}-{best_num + 1:03d}"
    return "REC-001"


# ---------------------------------------------------------------------------
# Operations
# ---------------------------------------------------------------------------


def op_read(args):
    content = read_file(Path(args.file))
    records = parse_records(content)

    if args.id:
        matches = [r for r in records if r["id"] == args.id]
        if not matches:
            raise RecordNotFound(args.id)
    else:
        matches = records
        if args.collection:
            matches = [r for r in matches if r["collection"] == args.collection]
        for f in args.filter or []:
            key, _, value = f.partition("=")
            matches = [r for r in matches if str(r["fields"].get(key)) == value]

    out = [
        {"id": r["id"], "collection": r["collection"], **r["fields"], "notas_ia": r["notes"]}
        for r in matches
    ]
    print(json.dumps(out, ensure_ascii=False, indent=2, default=str))


def op_create(args):
    path = Path(args.file)
    content = read_file(path)

    record_id = args.id or next_id(content, args.collection)
    if content and any(r["id"] == record_id for r in parse_records(content)):
        raise DuplicateId(record_id)

    fields = parse_field_args(args.field or [])
    block = render_block(record_id, fields, args.notes or "")

    if not content:
        parts = []
        if args.title:
            parts.append(f"# {args.title}\n")
        if args.collection:
            parts.append(f"## Colección: {args.collection}\n")
        parts.append(block)
        new_content = "\n".join(parts)
    elif args.collection:
        collections = list(COLLECTION_RE.finditer(content))
        target = next((m for m in collections if m.group("name") == args.collection), None)
        if target is None:
            new_content = (
                content.rstrip("\n") + f"\n\n## Colección: {args.collection}\n\n{block}"
            )
        else:
            next_heading = next((m for m in collections if m.start() > target.start()), None)
            insert_at = next_heading.start() if next_heading else len(content)
            before = content[:insert_at].rstrip("\n")
            after = content[insert_at:].lstrip("\n")
            new_content = before + "\n\n" + block
            new_content += ("\n\n" + after) if after else "\n"
    else:
        new_content = content.rstrip("\n") + "\n\n" + block

    if args.dry_run:
        print(new_content)
        return
    write_file(path, new_content)
    suffix = f" in collection '{args.collection}'" if args.collection else ""
    print(f"Created {record_id}{suffix}")


def op_update(args):
    path = Path(args.file)
    content = read_file(path)
    record = find_record(content, args.id)

    fields = dict(record["fields"])
    fields.update(parse_field_args(args.field or []))

    notes = record["notes"]
    if args.notes is not None:
        if args.notes_mode == "append" and notes:
            notes = notes + "\n\n" + args.notes
        else:
            notes = args.notes

    block = render_block(args.id, fields, notes)
    new_content = content[: record["start"]] + block + content[record["end"] :]

    if args.dry_run:
        print(new_content)
        return
    write_file(path, new_content)
    print(f"Updated {args.id}")


def op_delete(args):
    path = Path(args.file)
    content = read_file(path)
    record = find_record(content, args.id)

    new_content = content[: record["start"]] + content[record["end"] :]
    new_content = re.sub(r"\n{3,}", "\n\n", new_content)
    new_content = re.sub(r"\n+\Z", "\n", new_content)

    if args.dry_run:
        print(new_content)
        return
    write_file(path, new_content)
    print(f"Deleted {args.id}")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="CRUD over a Markdown record database.")
    sub = parser.add_subparsers(dest="command", required=True)

    p_read = sub.add_parser("read", help="Read one record by ID, or list/filter records.")
    p_read.add_argument("file")
    p_read.add_argument("--id")
    p_read.add_argument("--collection")
    p_read.add_argument("--filter", action="append", help="key=value, repeatable")
    p_read.set_defaults(func=op_read)

    p_create = sub.add_parser("create", help="Create a new record.")
    p_create.add_argument("file")
    p_create.add_argument("--id", help="Omit to auto-generate the next ID in sequence.")
    p_create.add_argument("--collection")
    p_create.add_argument(
        "--title", help="Top-level H1 title, used only when creating a brand-new file."
    )
    p_create.add_argument("--field", action="append", help="key=value, repeatable")
    p_create.add_argument("--notes", default="")
    p_create.add_argument("--dry-run", action="store_true")
    p_create.set_defaults(func=op_create)

    p_update = sub.add_parser("update", help="Update fields/notes of an existing record.")
    p_update.add_argument("file")
    p_update.add_argument("--id", required=True)
    p_update.add_argument("--field", action="append", help="key=value, repeatable")
    p_update.add_argument("--notes")
    p_update.add_argument("--notes-mode", choices=["replace", "append"], default="replace")
    p_update.add_argument("--dry-run", action="store_true")
    p_update.set_defaults(func=op_update)

    p_delete = sub.add_parser("delete", help="Delete a record by ID.")
    p_delete.add_argument("file")
    p_delete.add_argument("--id", required=True)
    p_delete.add_argument("--dry-run", action="store_true")
    p_delete.set_defaults(func=op_delete)

    return parser


def main(argv=None):
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        args.func(args)
    except RecordNotFound as e:
        print(f"Error: no record with ID '{e}' found.", file=sys.stderr)
        sys.exit(1)
    except DuplicateId as e:
        print(f"Error: ID '{e}' already exists.", file=sys.stderr)
        sys.exit(1)
    except ValueError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
