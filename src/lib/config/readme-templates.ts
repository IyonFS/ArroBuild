export type ReadmeCategory = "repository" | "profile";

export type RepositoryTemplateId = "minimal" | "full-docs" | "oss-friendly";
export type ProfileTemplateId = "personal-card" | "portfolio-style";
export type ReadmeTemplateId = RepositoryTemplateId | ProfileTemplateId;

export interface ReadmeTemplate {
  id: ReadmeTemplateId;
  category: ReadmeCategory;
  name: string;
  description: string;
  sampleMarkdown: string;
  styleGuide: string;
}

const REPOSITORY_TEMPLATES: ReadmeTemplate[] = [
  {
    id: "minimal",
    category: "repository",
    name: "Minimal",
    description: "Ringkas — overview, install, dan usage dasar.",
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
    description: "Struktur lengkap — prerequisites, env vars, arsitektur folder.",
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
    description: "Siap open source — badges, contributing, code of conduct.",
    sampleMarkdown: `# TaskFlow

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](package.json)

Open-source task manager for developers.

## Features

- ⚡ Fast local-first sync
- 🎨 Clean, accessible UI
- 🔌 REST API for integrations

## Getting Started

\`\`\`bash
npm install && npm run dev
\`\`\`

## Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

1. Fork the repo
2. Create your feature branch (\`git checkout -b feature/amazing\`)
3. Commit changes (\`git commit -m 'Add amazing feature'\`)
4. Push and open a Pull Request

## Code of Conduct

Be kind. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## License

[MIT](LICENSE) © 2026 TaskFlow Contributors
`,
    styleGuide:
      "Open source friendly README: shields.io-style badges, feature bullets with emoji, getting started, contributing guidelines, code of conduct mention, MIT license footer.",
  },
];

const PROFILE_TEMPLATES: ReadmeTemplate[] = [
  {
    id: "personal-card",
    category: "profile",
    name: "Personal Card",
    description: "Profil GitHub ringkas — bio, skills, dan kontak.",
    sampleMarkdown: `<div align="center">

# Hi, I'm Alex 👋

**Full-stack developer** · Jakarta, Indonesia

Building tools that help indie hackers ship faster.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://linkedin.com/in/you)
[![Email](https://img.shields.io/badge/Email-D14836?style=flat&logo=gmail&logoColor=white)](mailto:you@email.com)

</div>

## About

I specialize in **Next.js**, **TypeScript**, and **product design**. Currently building SaaS tools for solo founders.

## Tech Stack

![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/-Next.js-000000?style=flat-square&logo=next.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)

## Stats

![GitHub stats](https://github-readme-stats.vercel.app/api?username=you&show_icons=true&theme=dark)
`,
    styleGuide:
      "Personal card GitHub profile README: centered header with name and tagline, social badge links, about paragraph, tech stack shields, optional GitHub stats placeholder.",
  },
  {
    id: "portfolio-style",
    category: "profile",
    name: "Portfolio Style",
    description: "Showcase proyek — featured work, skills, dan CTA.",
    sampleMarkdown: `# Alex · Developer Portfolio

> *"I turn ideas into shipped products."*

---

## 🚀 Featured Projects

### [TaskFlow](https://github.com/you/taskflow)
Task manager for solo developers — Next.js, PostgreSQL, real-time sync.

### [DesignKit](https://github.com/you/designkit)
Open-source component library with 40+ accessible React components.

---

## 🛠 Skills

| Area | Tools |
|------|-------|
| Frontend | React, Next.js, Tailwind |
| Backend | Node.js, PostgreSQL, Prisma |
| DevOps | Vercel, Docker, GitHub Actions |

---

## 📬 Let's Connect

- 💼 [Portfolio](https://yoursite.dev)
- 🐦 [Twitter](https://twitter.com/you)
- 📧 you@email.com

---

⭐️ From [you](https://github.com/you)
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
