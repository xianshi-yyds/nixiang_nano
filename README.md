# nixiang_nano

`nixiang_nano` is a standalone Codex skill for generating images through Gemini Web in a signed-in browser session, with support for:

- text-to-image
- reference-image generation
- reusable multi-turn sessions
- local Gemini watermark removal after download
- stronger prompt-writing guidance for covers, posters, and thumbnail-style layouts

It is designed for people who want a `Nano Banana` style workflow inside Codex, but prefer using their own logged-in Gemini Web session instead of an official API key flow.

## Features

- Gemini Web image generation through local browser cookies
- Reference-image workflows for identity-preserving edits and variations
- Stream-aware image result extraction for Gemini responses that render in the UI before the network fully finishes
- Optional local watermark removal using the vendored MIT-licensed engine adapted from `GargantuaX/gemini-watermark-remover`
- Prompt-writing guidance merged from `baoyu-imagine`, including:
  - composition-first prompt structure
  - cover and poster layout phrasing
  - reference-image transformation templates

## Repository Layout

```text
.
├── SKILL.md
└── scripts/
    ├── main.ts
    ├── watermark-remover.ts
    ├── gemini-webapi/
    └── vendor/
        ├── baoyu-chrome-cdp/
        └── gemini-watermark-remover/
```

## Requirements

- `bun` or `npx -y bun`
- a local Chrome/Chromium session that can log into Gemini
- a user who accepts the reverse-engineered Gemini Web workflow

## Install Dependencies

```bash
cd /Users/xianshi/Downloads/flow_image/nixiang_nano/scripts
bun install
```

## Basic Usage

```bash
cd /Users/xianshi/Downloads/flow_image/nixiang_nano/scripts

# text response
bun main.ts --prompt "Describe a futuristic fashion poster"

# image generation
bun main.ts --prompt "A glossy product poster" --image out.png

# image generation with watermark removal
bun main.ts --prompt "A glossy product poster" --image out.png --remove-watermark

# reference-image generation
bun main.ts --prompt "Create a cinematic variation" --reference ref.png --image out.png

# multi-turn session
bun main.ts "Remember this style direction" --sessionId demo-style
bun main.ts "Generate another version with stronger contrast" --sessionId demo-style
```

## Main Options

- `--prompt`, `-p`: prompt text
- `--promptfiles`: concatenate prompt text from files
- `--model`, `-m`: Gemini model id
- `--image [path]`: save generated image
- `--remove-watermark`: run local watermark removal after the image is saved
- `--reference`, `--ref`: one or more reference images
- `--sessionId`: reuse a saved conversation session
- `--json`: print structured output
- `--login`: refresh Gemini cookies only

Run help anytime:

```bash
bun main.ts --help
```

## Watermark Removal

When `--remove-watermark` is enabled, the skill post-processes the saved Gemini image locally.

This implementation uses a vendored watermark-removal engine adapted from:

- [GargantuaX/gemini-watermark-remover](https://github.com/GargantuaX/gemini-watermark-remover)

The repository includes the original MIT license in:

- [scripts/vendor/gemini-watermark-remover/LICENSE](/Users/xianshi/Downloads/flow_image/nixiang_nano/scripts/vendor/gemini-watermark-remover/LICENSE)

## Prompt Writing Philosophy

This skill includes prompt-writing guidance inspired by `baoyu-imagine`.

Recommended prompt order:

1. Subject and identity
2. Composition and framing
3. Camera angle or lens
4. Pose or action
5. Scene or background
6. Lighting
7. Materials, color, and mood
8. Rendering style
9. Output constraints

Example:

```text
Use the reference image as the identity anchor for the woman's face, hair, makeup, and overall look. Recompose the scene as a 16:9 cover with the subject in the lower-right corner. Use an exaggerated fisheye lens and a top-down perspective. The subject should stretch one hand diagonally toward the upper-left corner. Add five floating 3D AI tool icons above her hand, arranged like a dynamic orbit. Light the scene with soft premium studio lighting and subtle reflections. Render in a clean high-end editorial advertising style.
```

For the full prompt-writing rules, see:

- [SKILL.md](/Users/xianshi/Downloads/flow_image/nixiang_nano/SKILL.md)

## Notes

- This project depends on reverse-engineered Gemini Web behavior, so it may break if Google changes the web client.
- The skill stores its own cookie/session data under the `nixiang-nano` app-data directory by default.
- If Gemini already renders an image in the chat UI but the CLI appears slower, this skill includes stream-aware extraction logic to surface generated image results earlier than the original upstream implementation.
