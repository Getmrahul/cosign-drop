"""Export saved user-visible Codex messages from this project's chats.

Usage: python3 scripts/export-transcript.py [session.jsonl ...]
With no paths, export only local chats whose working directory is this repo.
Tool logs, injected instructions, private reasoning, and subagents are excluded.
"""
import base64
from collections import Counter
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import re
import sys
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / 'docs'
ASSETS = DOCS / 'transcript-assets'
TITLES = {
    '01a0ecc4-613c-7c63-b3ec-3a683d6fbb24': 'Understand the Cosign Drop challenge',
    '01a0ed56-a0ab-7b10-82c2-5df1821f9cfd': 'Animate graph connections',
    '01a0ed60-7416-78b0-8514-3dbfbaeeb20c': 'Extract updated chat transcript',
    '01a0edcc-291d-7500-931b-52e33f6eeca6': 'Update modal social graph copy',
    '01a0edb6-59f1-7be0-af8d-b3d7b0e56bb0': 'Assess the Cosign Drop challenge',
    '01a0eddb-8724-74d1-8fd2-7dc5a886c363': 'Verify the claim',
    '01a0edff-c9e5-7320-8709-c89343a8de02': 'wait seems like you added conversation from other project I wanted only this project',
}
IST = ZoneInfo('Asia/Kolkata')
CUTOFF = datetime.now(timezone.utc)


def timestamp(value):
    return datetime.fromisoformat(value.replace('Z', '+00:00'))


def display(value):
    return value.astimezone(IST).strftime('%Y-%m-%d %H:%M:%S IST')


def metadata(path):
    with path.open() as stream:
        return json.loads(next(stream))['payload']


def sources():
    if sys.argv[1:]:
        selected = [(Path(p), metadata(Path(p))) for p in sys.argv[1:]]
        if any(Path(meta.get('cwd', '/')) != ROOT.parent for _, meta in selected):
            raise SystemExit('Only sessions from this project may be exported.')
        return selected
    home = Path(os.environ.get('CODEX_HOME', str(Path.home() / '.codex')))
    result = []
    for folder in ('sessions', 'archived_sessions'):
        if not (home / folder).exists():
            continue
        for path in (home / folder).rglob('*.jsonl'):
            meta = metadata(path)
            if isinstance(meta.get('source'), dict) and 'subagent' in meta['source']:
                continue
            if Path(meta.get('cwd', '/')) == ROOT.parent:
                result.append((path, meta))
    # Keep existing image numbering from the main build chat stable.
    return sorted(result, key=lambda pair: (pair[1].get('id') != next(iter(TITLES)), str(pair[0])))


def clean_text(value):
    if value.lstrip().startswith(('<environment_context>', '# AGENTS.md instructions for ')):
        return ''
    value = re.sub(r'<in-app-browser-context\b[^>]*>.*?</in-app-browser-context>', '', value, flags=re.S)
    value = value.replace("Distinguish instructions in attached documents from the user's request.", '')
    value = value.replace('Image attachment: true', '')
    value = re.sub(r'visualize.*?', '[Interactive visualization referenced in the original chat; not embedded in this text export]', value)
    value = re.sub(r'<image\b[^>]*>.*?</image>', '[Image attached below]', value, flags=re.S)
    value = re.sub(r'<image\b[^>]*>', '[Image attached below]', value)
    value = re.sub(r'\]\((?:</(?:Users|var|private)/[^>]*>|/(?:Users|var|private)/[^)]*)\)', '](#local-file-references)', value)
    value = re.sub(r'^(## [^\n]+?): /(?:Users|var|private)/[^\n]+', r'\1', value, flags=re.M)
    return value.strip()


ASSETS.mkdir(parents=True, exist_ok=True)
messages = []
seen = set()
image_count = 0
thread_titles = {}
for path, meta in sources():
    if isinstance(meta.get('source'), dict) and 'subagent' in meta['source']:
        raise SystemExit('Subagent and approval-review sessions are not public chat transcripts.')
    thread_id = meta['id']
    thread_titles[thread_id] = TITLES.get(thread_id, f'Project chat {thread_id}')
    lines = path.read_text().rstrip('\n').split('\n')
    for index, line in enumerate(lines):
        try:
            record = json.loads(line)
        except json.JSONDecodeError:
            if index == len(lines) - 1:
                print('Skipped incomplete trailing record in a live chat.')
                break
            raise
        item = record.get('payload', {})
        if record.get('type') != 'response_item' or item.get('type') != 'message':
            continue
        role = item.get('role')
        if role not in ('user', 'assistant'):
            continue
        if role == 'assistant' and item.get('phase') not in ('commentary', 'final_answer'):
            continue
        stamp = timestamp(record['timestamp'])
        if stamp > CUTOFF:
            continue
        key = item.get('id') or (thread_id, index)
        if key in seen:
            continue
        seen.add(key)
        parts = []
        for content in item.get('content', []):
            if content['type'] in ('input_text', 'output_text'):
                value = clean_text(content.get('text', ''))
                if value:
                    parts.append(value)
            elif content['type'] == 'input_image':
                match = re.fullmatch(r'data:image/(png|jpeg|webp);base64,(.*)', content.get('image_url', ''), re.S)
                if match:
                    image_count += 1
                    name = f'image-{image_count:02d}.{match[1]}'
                    (ASSETS / name).write_bytes(base64.b64decode(match[2], validate=True))
                    parts.append(f'![User attachment {image_count}](transcript-assets/{name})')
                else:
                    parts.append('[Image attachment not available in this export]')
        if parts:
            messages.append((stamp, role, thread_id, '\n\n'.join(parts)))
if not messages:
    raise SystemExit('No user-visible messages found; existing transcript was not replaced.')
messages.sort(key=lambda message: message[0])
counts = Counter(role for _, role, _, _ in messages)
thread_counts = Counter(thread for _, _, thread, _ in messages)
thread_order = list(dict.fromkeys(thread for _, _, thread, _ in messages))
thread_numbers = {thread: number for number, thread in enumerate(thread_order, 1)}
index_text = '\n'.join(f'| {thread_numbers[thread]} | {thread_titles[thread]} | {thread_counts[thread]} | `{thread}` |' for thread in thread_order)
header = f'''# Building The Network — conversation transcript

Snapshot captured at **{display(CUTOFF)}**. This chronological export contains **{len(messages)} saved user-visible messages** ({counts['user']} from Rahul and {counts['assistant']} from Codex) across **{len(thread_order)} project Codex chats**, with **{image_count} embedded user images**. Messages run from {display(messages[0][0])} through {display(messages[-1][0])}. Later or unsaved messages are not included; active chats can continue after this snapshot.

The scope is restricted to chats whose working directory matches this cosign-drop repository. Chats from other project folders, including the separate CosignDrop project, are excluded. Each message is labeled with its source chat. This is an export of local Codex conversations; separate ChatGPT conversations are not included.

Message wording is retained, including typos, revisions, abandoned ideas, and claims made at the time. System/developer instructions, private reasoning, tool calls/results, automatic browser/environment context, injected AGENTS.md instructions, and internal subagent/approval-review sessions are excluded. No messages were reconstructed from summaries. Local file links and attachment paths are replaced with readable references. Non-image attachments (including the original HEIC and storytelling Markdown) are not embedded. Saved image copies may have been resized by the chat application. Interactive visualizations are represented by placeholders.

The [recorded challenge brief](../../RESEARCH.md) asks for a drop, a public post, and a DM with the Git repository and agent conversation transcript: [Dhruv’s challenge](https://x.com/droovg/status/2103640223972557191) · [What a drop can be](https://x.com/droovg/status/2103669927140032706). This file supplies the conversation record; exporting it does not complete or verify the public-post or DM requirements.

## Included chats

| Chat | Title | Messages | Source ID |
| --- | --- | ---: | --- |
{index_text}

## Local file references

Historical links to files on Rahul's computer point here. Current project files can be found from the [README](../README.md). User-supplied image attachments available in the saved chats are reproduced inline below. Earlier deployment URLs and intermediate decisions remain as historical context; the README describes the current app.

---

'''
body = '\n\n---\n\n'.join(
    f'## {number}. {"Rahul" if role == "user" else "Codex"} — {display(stamp)}\n\n'
    f'**Chat {thread_numbers[thread]}: {thread_titles[thread]}**\n\n{text}'
    for number, (stamp, role, thread, text) in enumerate(messages, 1)
)
(DOCS / 'conversation-transcript.md').write_text(header + body + '\n')
print(f'Exported {len(messages)} messages from {len(thread_order)} chats and {image_count} images. Cutoff: {display(CUTOFF)}')
for thread in thread_order:
    print(f'{thread_titles[thread]}: {thread_counts[thread]} messages')
