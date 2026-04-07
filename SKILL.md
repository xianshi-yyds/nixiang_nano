---
name: nixiang_nano
description: Generates text and images through Gemini Web with strong support for reference-image generation, reusable chat sessions, and optional Gemini watermark removal on saved outputs. Use when you want Nano Banana style image creation from prompts or references in your own signed-in browser session.
version: 0.2.0
metadata:
  openclaw:
    homepage: https://github.com/xianshi-yyds/nixiang_nano
    requires:
      anyBins:
        - bun
        - npx
---

# Nixiang Nano

Standalone Gemini Web skill for prompt-based and reference-image image generation, with optional local Gemini watermark removal for saved images.

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
| `scripts/vendor/gemini-watermark-remover/*` | Vendored watermark-removal engine adapted from GargantuaX's MIT-licensed project |

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

## Generation Workflow

Before generating, the agent should do these in order:

1. Confirm whether the task is text-only, image generation, or reference-image generation.
2. If the user gave a reference image, preserve identity cues first, then layer composition and style changes on top.
3. Decide aspect ratio before writing the final prompt. Covers and thumbnails usually want `16:9`; portraits often want `3:4` or `9:16`.
4. State the active model before generation in this form: `Using Gemini Web / <model>`.
5. Write one clean production prompt instead of a chatty instruction chain.

## Prompt Writing Rules

Write prompts in a compact production order, similar to the stronger `baoyu-imagine` workflows:

1. Subject and identity
2. Composition and framing
3. Camera angle or lens language
4. Pose or action
5. Scene or background
6. Lighting
7. Materials, color, and mood
8. Rendering style or finish
9. Output constraints

Good prompt blocks usually include:
- who or what is in the image
- where the subject sits in frame
- viewpoint, lens, or distance
- key action or gesture
- visual style and lighting
- format constraints like `16:9 cover`, `clean negative space`, or `editorial poster`

Prefer direct visual language over abstract requests. For example:
- Better: `fisheye lens, top-down view, subject placed in the lower-right corner, right arm reaching toward the upper-left`
- Worse: `make it feel more dynamic and cool`

When the user provides a reference image, separate the prompt into two responsibilities:
- Preserve: face identity, hair, age range, makeup level, recognizable styling
- Transform: composition, camera angle, wardrobe, background, props, lighting, layout

For covers, thumbnails, and posters:
- specify layout position explicitly, such as `subject in lower-right third`
- mention empty space needs, such as `leave clean space in the upper-left for title graphics`
- if graphic elements are required, describe count, placement, and visual treatment, for example `five floating 3D AI tool icons above her outstretched hand`

For Gemini image generation specifically:
- use one final polished prompt rather than multiple contradictory sentences
- avoid long negative-prompt style lists
- if exact aspect ratio matters, mention it in both CLI args and prompt wording
- if text rendering matters, describe it, but do not rely on Gemini for dense or precise typography

## Prompt Templates

Use these as templates and then fill in the actual subject and scene.

**Text-to-image**

```text
[Subject], [composition/framing], [camera/lens/viewpoint], [pose/action], [scene/background], [lighting], [style/rendering], [color/mood], [output constraint].
```

Example:

```text
A stylish young woman, placed in the lower-right corner of a 16:9 cover image, dramatic fisheye lens and top-down perspective, reaching her hand toward the upper-left corner, clean modern interior background, soft cinematic lighting, polished commercial editorial style, warm neutral palette with vivid accent colors, leave clear space in the upper-left for five floating 3D AI tool icons.
```

**Reference-image transformation**

```text
Use the reference image as the identity anchor for the woman's face, hair, and overall look. Recompose the scene as [new composition]. Use [camera/lens]. The subject should [pose/action]. Add [environment/props]. Light the scene with [lighting]. Render in [style]. Keep the image suitable for [cover/poster/thumbnail] in [aspect ratio].
```

Example:

```text
Use the reference image as the identity anchor for the woman's face, hair, makeup, and overall look. Recompose the scene as a 16:9 cover with the subject in the lower-right corner. Use an exaggerated fisheye lens and a top-down perspective. The subject should stretch one hand diagonally toward the upper-left corner. Add five floating 3D AI tool icons above her hand, arranged like a dynamic orbit. Light the scene with soft premium studio lighting and subtle reflections. Render in a clean high-end editorial advertising style.
```

## Usage

```bash
# Text generation
${BUN_X} {baseDir}/scripts/main.ts "Your prompt"
${BUN_X} {baseDir}/scripts/main.ts --prompt "Your prompt" --model gemini-3-flash

# Image generation
${BUN_X} {baseDir}/scripts/main.ts --prompt "A glossy product poster" --image out.png
${BUN_X} {baseDir}/scripts/main.ts --prompt "A glossy product poster" --image out.png --remove-watermark
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
| `--remove-watermark` | Remove Gemini watermark from the saved image after download |
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
