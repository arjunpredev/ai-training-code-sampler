<p align="center">
  <img src="public/logo.jpg" alt="AI Training Code Sampler" width="80" height="80" style="border-radius: 16px;" />
</p>

<h1 align="center">AI Training Code Sampler</h1>

<p align="center">
  <strong>Prepare your code repository for AI training data evaluation</strong>
</p>

<p align="center">
  <a href="https://code-sampler.pre.dev">
    <img src="https://img.shields.io/badge/🚀_Try_it_Free-code--sampler.pre.dev-blue?style=for-the-badge" alt="Try it Free" />
  </a>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#how-it-works">How It Works</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#output-format">Output Format</a> •
  <a href="#tech-stack">Tech Stack</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-blue?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-4.0-blue?logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vite-7.0-purple?logo=vite" alt="Vite" />
</p>

---

<p align="center">
  <a href="https://pre.dev">
    <img src="https://pre.dev/predev_logo_name.png" alt="pre.dev" height="40" style="border-radius: 4px;" />
  </a>
  <br />
  <sub>Built on <a href="https://pre.dev"><strong>pre.dev</strong></a> — Build complex software, simply</sub>
</p>

## Overview

AI Training Code Sampler is a browser-based tool that helps developers prepare their code repositories for AI training data evaluation. Upload your ZIP file, curate your code sample, and download a properly formatted JSONL package ready for submission.

**👉 Use it for free at [code-sampler.pre.dev](https://code-sampler.pre.dev)**

**All processing happens locally in your browser — your code never leaves your machine.**

---

## Features

- **Drag & Drop Upload** — Simply drop your ZIP file to get started
- **Monaco Editor** — Full-featured code editor with syntax highlighting for 50+ languages
- **Live Diff View** — Compare your changes against the original code
- **File Management** — Delete files, search through your codebase, and organize your sample
- **Language Statistics** — See a breakdown of lines, characters, and files per language
- **Progress Tracking** — Monitor your progress toward the 5,000 line minimum
- **JSONL Export** — Download properly formatted files ready for AI training evaluation
- **Mobile Responsive** — Works on desktop and mobile devices

---

## How It Works

1. **Upload** — Drop your repository ZIP file into the upload zone
2. **Curate** — Browse files, remove what you don't want, and edit code as needed
3. **Review** — Check the language breakdown and ensure you meet the minimum line count
4. **Download** — Get your JSONL-encoded package ready for submission

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/arjunpredev/ai-training-code-sampler.git

# Navigate to the project
cd ai-training-code-sampler

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## Output Format

The tool generates a ZIP package containing:

### 1. JSONL Encoded Files (`{repo-name}.jsonl`)

Each line is a JSON object with the following structure:

```json
{"repo": "my-project", "filename": "src/index.ts", "text": "// file contents here..."}
```

### 2. Language Statistics (`{repo-name}_stats.json`)

```json
{
  "totalLines": 12500,
  "totalChars": 450000,
  "totalFiles": 85,
  "languages": [
    { "language": "TypeScript", "lineCount": 8000, "charCount": 300000, "fileCount": 45, "percentage": 64 },
    { "language": "JavaScript", "lineCount": 3000, "charCount": 120000, "fileCount": 30, "percentage": 24 }
  ]
}
```

---

## Tech Stack

- **React 19** — UI framework
- **TypeScript** — Type safety
- **Vite** — Build tool
- **Tailwind CSS 4** — Styling
- **Monaco Editor** — Code editing
- **JSZip** — ZIP file handling
- **React Router** — Client-side routing
- **Lucide React** — Icons

---

## File Filtering

The tool automatically filters out:

- Binary files (images, executables, fonts, etc.)
- Dependencies (`node_modules`, `vendor`, `venv`, etc.)
- Build artifacts (`dist`, `build`, `.next`, etc.)
- Lock files (`package-lock.json`, `yarn.lock`, etc.)
- Configuration files (`.env`, `.git`, etc.)

---

## Privacy

Your code is processed entirely in your browser using the Web APIs. No data is sent to any server. The tool uses:

- `FileReader` API for reading ZIP contents
- `JSZip` for extraction
- `sessionStorage` / React Router state for temporary data
- `Blob` API for generating downloads

---

## License

MIT License — feel free to use this for your own projects.
