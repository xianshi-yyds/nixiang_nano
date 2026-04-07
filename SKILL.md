---
name: nixiang_nano
description: Generates text and images through Gemini Web with strong support for reference-image generation, downloaded outputs, and reusable chat sessions. Use when you want Nano Banana style image creation from prompts or references in your own signed-in browser session.
version: 0.1.0
metadata:
  openclaw:
    homepage: https://github.com/xianshi-yyds/nixiang_nano
    requires:
      anyBins:
        - bun
        - npx
---

# Nixiang Nano

Standalone Gemini Web skill for prompt-based and reference-image image generation.

## Script Directory

All scripts live in the `scripts/` subdirectory.

**Agent Execution Instructions**:
1. Resolve this file's directory as `{baseDir}`
2. Script path = `{baseDir}/scripts/<script-name>.ts`
3. Resolve `${BUN_X}` runtime: use `bun` if installed, otherwise `npx -y bun`
4. Replace `{baseDir}` and `${BUN_X}` with real values before running commands

**Script Reference**:
| Script | Purpose |
|--------|---------|
| `scripts/main.ts` | CLI entry point for text generation, image generation, vision input, and session management |
| `scripts/gemini-webapi/*` | Gemini Web client, parser, authentication helpers, and image download logic |

## Consent Check

This skill uses a reverse-engineered Gemini Web interface. Before first use, confirm the user accepts that risk and record consent locally.

**Default consent file locations**:
- macOS: `~/Library/Application Support/nixiang-nano/gemini-web/consent.json`
- Linux: `~/.local/share/nixiang-nano/gemini-web/consent.json`
- Windows: `%APPDATA%\nixiang-nano\gemini-web\consent.json`

**Consent file format**:
`{"version":1,"accepted":true,"acceptedAt":"<ISO>","disclaimerVersion":"1.0"}`

## Preferences

Optional project or user overrides can live in:

```bash
test -f .nixiang-nano/EXTEND.md && echo "project"
test -f "${XDG_CONFIG_HOME:-$HOME/.config}/nixiang-nano/EXTEND.md" && echo "xdg"
test -f "$HOME/.nixiang-nano/EXTEND.md" && echo "user"
```

```powershell
if (Test-Path .nixiang-nano/EXTEND.md) { "project" }
$xdg = if ($env:XDG_CONFIG_HOME) { $env:XDG_CONFIG_HOME } else { "$HOME/.config" }
if (Test-Path "$xdg/nixiang-nano/EXTEND.md") { "xdg" }
if (Test-Path "$HOME/.nixiang-nano/EXTEND.md") { "user" }
```

Use `EXTEND.md` for defaults like preferred model, proxy guidance, or custom data directory notes.

## Usage

```bash
# Text generation
${BUN_X} {baseDir}/scripts/main.ts "Your prompt"
${BUN_X} {baseDir}/scripts/main.ts --prompt "Your prompt" --model gemini-3-flash

# Image generation
${BUN_X} {baseDir}/scripts/main.ts --prompt "A glossy product poster" --image out.png
${BUN_X} {baseDir}/scripts/main.ts --promptfiles system.md content.md --image out.png

# Reference-image generation
${BUN_X} {baseDir}/scripts/main.ts --prompt "Describe this image" --reference ref.png
${BUN_X} {baseDir}/scripts/main.ts --prompt "Create a cinematic variation" --reference ref.png --image out.png

# Multi-turn conversation
${BUN_X} {baseDir}/scripts/main.ts "Remember this style" --sessionId session-abc
${BUN_X} {baseDir}/scripts/main.ts "Generate another one" --sessionId session-abc

# JSON output
${BUN_X} {baseDir}/scripts/main.ts "Hello" --json
```

## Options

| Option | Description |
|--------|-------------|
| `--prompt`, `-p` | Prompt text |
| `--promptfiles` | Read prompt from one or more files |
| `--model`, `-m` | Model id |
| `--image [path]` | Generate and save an image |
| `--reference`, `--ref` | Reference image files |
| `--sessionId` | Reuse a saved multi-turn session |
| `--list-sessions` | List saved sessions |
| `--json` | Output machine-readable JSON |
| `--login` | Refresh browser cookies, then exit |
| `--cookie-path` | Override cookie file path |
| `--profile-dir` | Override Chrome profile dir |

## Default Storage

By default this skill stores cookies, sessions, and login state under:
- macOS: `~/Library/Application Support/nixiang-nano/gemini-web`
- Linux: `~/.local/share/nixiang-nano/gemini-web`
- Windows: `%APPDATA%\nixiang-nano\gemini-web`

You can override those paths with the existing `GEMINI_WEB_*` environment variables if needed.
