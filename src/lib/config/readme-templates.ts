export type ReadmeCategory = "repository" | "profile";

export type RepositoryTemplateId = "minimal" | "full-docs" | "oss-friendly";
export type ProfileTemplateId = "personal-card" | "portfolio-style";
export type ReadmeTemplateId = RepositoryTemplateId | ProfileTemplateId;

/** Visual skeleton style for gallery placeholder cards */
export type ReadmePreviewLayout =
  | "minimal-stack"
  | "docs-sections"
  | "oss-badges"
  | "profile-card"
  | "portfolio-list";

export interface ReadmeTemplate {
  id: ReadmeTemplateId;
  category: ReadmeCategory;
  name: string;
  /** Short label under the title */
  description: string;
  /** Longer copy for the etalase card */
  blurb: string;
  /** Who this template fits */
  bestFor: string;
  tags: string[];
  previewLayout: ReadmePreviewLayout;
  /**
   * Optional cover image for the gallery card.
   * Place assets in /public/tools/readme/ — when set, shown instead of live markdown.
   */
  previewImage?: string;
  sampleMarkdown: string;
  styleGuide: string;
}

const REPOSITORY_TEMPLATES: ReadmeTemplate[] = [
  {
    id: "minimal",
    category: "repository",
    name: "Minimal",
    description: "Ringkas — overview, install, usage.",
    blurb:
      "Satu layar cukup. Cocok kalau repo masih kecil dan kamu hanya butuh orang lain paham cara install + jalanin project.",
    bestFor: "MVP, side project, prototype",
    tags: ["Ringkas", "Quick start", "Tabel scripts"],
    previewLayout: "minimal-stack",
    sampleMarkdown: `# TaskFlow

A lightweight task manager for solo developers.

## Quick Start

\`\`\`bash
npm install
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| \`npm run dev\` | Start dev server |
| \`npm run build\` | Production build |
`,
    styleGuide:
      "Minimal README: short project title, one-paragraph overview, quick start with install + run commands, scripts table. No badges, no long sections.",
  },
  {
    id: "full-docs",
    category: "repository",
    name: "Dokumentasi Lengkap",
    description: "Prerequisites, env vars, struktur folder.",
    blurb:
      "Struktur dokumentasi yang jelas: daftar isi, prasyarat, instalasi, environment variables, dan peta folder. Siap buat tim atau kamu sendiri 3 bulan kemudian.",
    bestFor: "SaaS, produk serius, onboarding",
    tags: ["TOC", "Env vars", "Folder tree"],
    previewLayout: "docs-sections",
    sampleMarkdown: `# TaskFlow

> Task management built for indie hackers who ship fast.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Development](#development)
- [License](#license)

## Prerequisites

- Node.js 20+
- PostgreSQL 15+

## Installation

\`\`\`bash
git clone https://github.com/you/taskflow.git
cd taskflow
npm install
cp .env.example .env
npm run dev
\`\`\`

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| \`DATABASE_URL\` | Yes | PostgreSQL connection string |
| \`NEXTAUTH_SECRET\` | Yes | Session encryption key |

## Project Structure

\`\`\`
src/
├── app/          # Next.js routes
├── components/   # UI components
└── lib/          # Shared utilities
\`\`\`

## License

MIT
`,
    styleGuide:
      "Full documentation README: tagline quote, table of contents, prerequisites, detailed installation, env vars table, folder structure tree, development section, license.",
  },
  {
    id: "oss-friendly",
    category: "repository",
    name: "Open Source Friendly",
    description: "Badges, contributing, code of conduct.",
    blurb:
      "Tampil seperti repo open source yang matang: badge status, daftar fitur, panduan contribute, dan license. Bikin kontributor merasa diundang.",
    bestFor: "Library, tools publik, komunitas",
    tags: ["Badges", "Contributing", "License"],
    previewLayout: "oss-badges",
    sampleMarkdown: `# TaskFlow

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](package.json)

Open-source task manager for developers.

## Features

- Fast local-first sync
- Clean, accessible UI
- REST API for integrations

## Getting Started

\`\`\`bash
npm install && npm run dev
\`\`\`

## Contributing

Contributions welcome! Please read CONTRIBUTING.md first.

1. Fork the repo
2. Create your feature branch
3. Commit changes
4. Push and open a Pull Request

## Code of Conduct

Be kind. See CODE_OF_CONDUCT.md.

## License

MIT
`,
    styleGuide:
      "Open source friendly README: shields.io-style badges, feature bullets, getting started, contributing guidelines, code of conduct mention, MIT license footer. Avoid emoji in feature lists.",
  },
];

const PROFILE_TEMPLATES: ReadmeTemplate[] = [
  {
    id: "personal-card",
    category: "profile",
    name: "Personal Card",
    description: "Bio, skills, dan kontak di satu kartu.",
    blurb:
      "Profil GitHub sebagai kartu identitas: nama, tagline, social links, tech stack shields, dan stats. Ringkas tapi terasa profesional.",
    bestFor: "Profil personal, job seeker",
    tags: ["Centered", "Social", "Stats"],
    previewLayout: "profile-card",
    sampleMarkdown: `<div align="center">

# Hi, I'm Alex

**Full-stack developer** · Jakarta, Indonesia

Building tools that help indie hackers ship faster.

</div>

## About

I specialize in **Next.js**, **TypeScript**, and **product design**. Currently building SaaS tools for solo founders.

## Tech Stack

TypeScript · Next.js · PostgreSQL

## Stats

GitHub stats placeholder
`,
    styleGuide:
      "Personal card GitHub profile README: centered header with name and tagline, social badge links, about paragraph, tech stack shields, optional GitHub stats placeholder.",
  },
  {
    id: "portfolio-style",
    category: "profile",
    name: "Portfolio Style",
    description: "Featured projects, skills, CTA.",
    blurb:
      "Profil yang menonjolkan karya: quote, daftar featured projects, tabel skills, dan ajakan connect. Cocok kalau README profil = portofolio ringkas.",
    bestFor: "Freelancer, showcase karya",
    tags: ["Projects", "Skills table", "CTA"],
    previewLayout: "portfolio-list",
    sampleMarkdown: `# Alex · Developer Portfolio

> "I turn ideas into shipped products."

## Featured Projects

### TaskFlow
Task manager for solo developers — Next.js, PostgreSQL, real-time sync.

### DesignKit
Open-source component library with 40+ accessible React components.

## Skills

| Area | Tools |
|------|-------|
| Frontend | React, Next.js, Tailwind |
| Backend | Node.js, PostgreSQL, Prisma |

## Let's Connect

Portfolio · Twitter · Email
`,
    styleGuide:
      "Portfolio style GitHub profile README: quote tagline, featured projects with links and one-line descriptions, skills table, connect/CTA section, footer credit line.",
  },
];

export const README_TEMPLATES: ReadmeTemplate[] = [
  ...REPOSITORY_TEMPLATES,
  ...PROFILE_TEMPLATES,
];

export function getTemplatesByCategory(category: ReadmeCategory): ReadmeTemplate[] {
  return README_TEMPLATES.filter((t) => t.category === category);
}

export function getTemplateById(id: ReadmeTemplateId): ReadmeTemplate | undefined {
  return README_TEMPLATES.find((t) => t.id === id);
}
