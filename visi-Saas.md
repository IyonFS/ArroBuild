# 🚀 Visi Produk SaaS PRD Generator

> **Core Idea**
>
> Jangan membangun **AI PRD Generator**.
>
> Bangun **AI Project Compiler** yang mengubah sebuah ide menjadi seluruh fondasi proyek software yang siap digunakan oleh AI Coding Agent seperti Cursor, Claude Code, Windsurf, Roo Code, atau OpenHands.

---

# Positioning Produk

## ❌ Positioning Lama

> Generate PRD dengan AI

Masalahnya:

- Mudah ditiru
- Value kecil
- PRD bukan kebutuhan utama developer

---

## ✅ Positioning Baru

> Generate AI-Ready Software Project

atau

> AI Project Compiler

Flow produk:

```text
Idea
    ↓
Knowledge Model
    ↓
PRD
Architecture
Database
API
Design System
Tasks
AI Rules
Deploy Config
    ↓
Cursor / Claude / Windsurf Ready
```

---

# Value Proposition

Developer sebenarnya **tidak membutuhkan PRD**.

Developer membutuhkan:

- AI memahami proyek dengan benar
- AI tidak hallucination
- AI memiliki context lengkap
- AI menghasilkan kode yang konsisten

Artinya nilai utama bukan dokumen, melainkan **mengurangi ambiguity**.

---

# Filosofi Produk

Jangan menjadikan PRD sebagai output utama.

PRD hanyalah salah satu representasi dari informasi proyek.

Yang menjadi sumber utama adalah:

```text
Idea

↓

Structured Knowledge

↓

Semua Dokumen
```

---

# Arsitektur Informasi

## Layer 1 — Business

- Vision
- Goals
- User Problem
- Success Metrics

---

## Layer 2 — Product

- PRD
- User Flow
- Feature List
- Acceptance Criteria

---

## Layer 3 — Engineering

- Architecture
- Database
- API
- Folder Structure
- Coding Rules

---

## Layer 4 — AI

- Cursor Rules
- Claude Context
- Agent
- Prompt Memory
- MCP Config

---

# PRD yang Ideal

Sebagian besar AI membuat PRD terlalu panjang.

Contoh:

- Background
- Vision
- Market
- Business
- Functional
- Non Functional
- Security
- Timeline
- Analytics

Sering kali mencapai **5000–10000 token**.

Masalah:

- Mahal
- Tidak efisien
- Jarang dibaca ulang
- Menghabiskan context window AI

---

## Format PRD yang Direkomendasikan

```text
Product Overview

Target User

Core Problem

Success Criteria

Feature List

Acceptance Criteria

Constraints

Technical Notes
```

Target ukuran:

**700–1500 token**

---

# Modular Documentation

Daripada:

```
1 PRD = 8000 token
```

Lebih baik:

```
PRD
1200 token

Architecture
900 token

Database
500 token

Task
800 token

Design System
700 token

AI Rules
600 token
```

Keuntungan:

- Token lebih hemat
- AI hanya membaca file yang diperlukan
- Mudah diperbarui
- Mudah di-export

---

# Expandable Documentation

Berikan pilihan kedalaman dokumentasi.

## Simple

- ±800 token

Cocok untuk:

- Landing Page
- Portfolio
- MVP kecil

---

## Standard

- ±1800 token

Cocok untuk:

- SaaS
- Dashboard
- Internal Tools

---

## Enterprise

- ±5000 token

Cocok untuk:

- Marketplace
- ERP
- Fintech
- Healthcare

Dengan demikian AI hanya menggunakan token sesuai kompleksitas proyek.

---

# Progressive Context Generation

Jangan langsung generate semua file.

Flow yang direkomendasikan:

```
User Input

↓

Normalize

↓

Overview

↓

Analisis Kompleksitas

↓

Generate Dokumen
```

Contoh:

Input:

```
Todo App
```

AI cukup membuat:

- PRD 900 token

Sedangkan:

```
Marketplace
```

AI membuat:

- PRD 3000 token
- Architecture lebih lengkap
- API lebih lengkap

Output menjadi adaptif terhadap kompleksitas proyek.

---

# Single Source of Truth

Gunakan JSON internal.

Flow:

```
User Input

↓

Normalize

↓

JSON

↓

Markdown Generator
```

Contoh:

```json
{
  "product": {},
  "users": [],
  "features": [],
  "constraints": [],
  "techStack": {}
}
```

Semua file berasal dari JSON tersebut.

Keuntungan:

- Tidak ada inkonsistensi antar file
- Mudah update
- Bisa regenerate sebagian file
- Token lebih hemat

---

# File Inti (Core Files)

Minimal:

```
01-project-context.md

02-prd.md

03-roadmap.md

04-architecture.md

05-database.md

06-design-system.md

07-ai-rules.md

08-tasks.md
```

Ini sudah cukup untuk mayoritas proyek.

---

# File Premium

Untuk paket Pro:

```
api.md

testing.md

deployment.md

security.md

performance.md

growth.md

analytics.md
```

Ini dapat menjadi pembeda paket berbayar.

---

# Knowledge Graph

Saat ini mayoritas generator menghasilkan markdown statis.

Padahal AI Coding Agent lebih membutuhkan hubungan antar data.

Contoh:

```
Feature

↓

Database

↓

API

↓

Frontend

↓

Testing
```

Misalnya:

```
Login

↓

Users Table

↓

POST /login

↓

LoginPage

↓

JWT

↓

Middleware
```

Jika Login berubah, seluruh node terkait ikut diperbarui.

Ini jauh lebih powerful dibanding markdown biasa.

---

# Modular PRD

Jangan membuat PRD berupa dokumen panjang.

Lebih baik:

```
PRD

├── Summary

├── Users

├── Features

│   ├── Login

│   ├── Dashboard

│   ├── Payment

│   └── Notification

├── Constraints

└── Metrics
```

Setiap feature memiliki ID unik.

Contoh:

```
FEAT-001 Login

FEAT-002 Dashboard

FEAT-003 Subscription
```

Kemudian file lain cukup mereferensikan ID tersebut.

Architecture:

```
Uses:

FEAT-001

FEAT-003
```

Database:

```
Implements:

FEAT-003
```

Tasks:

```
Implement FEAT-001

Implement FEAT-003
```

Keuntungan:

- AI tidak perlu membaca seluruh PRD
- Context jauh lebih kecil
- Lebih cepat
- Mudah melakukan incremental update

---

# Arsitektur Produk yang Direkomendasikan

```
Idea

↓

Knowledge Model (JSON)

↓

Compiler Engine

├── PRD

├── Architecture

├── Database

├── API

├── Tasks

├── AI Rules

├── Design System

├── Deploy Guide

└── Testing Guide

↓

Export

├── Cursor

├── Claude Code

├── Windsurf

├── Roo Code

└── ZIP Bundle
```

---

# Prioritas Pengembangan

## High Priority

- Single Source of Truth (JSON)
- Modular PRD
- AI Rules
- Architecture
- Tasks
- Export

---

## Medium Priority

- API Docs
- Testing
- Security
- Deployment
- Analytics

---

## Future Vision

- Knowledge Graph
- Incremental Update
- Partial Regeneration
- Multi-Agent Workflow
- Live Project Sync
- GitHub Integration
- Notion Integration
- MCP Configuration
- Agent Memory

---

# Kesimpulan

ArroBuild sebaiknya tidak diposisikan sebagai **AI PRD Generator**, melainkan sebagai **AI Project Compiler**.

Prinsip utama yang direkomendasikan:

- PRD hanyalah salah satu output.
- Semua dokumen berasal dari satu Knowledge Model (JSON) sebagai *Single Source of Truth*.
- Dokumentasi dibuat modular agar hemat token.
- Kedalaman dokumentasi bersifat adaptif sesuai kompleksitas proyek.
- Gunakan Feature ID dan Knowledge Graph agar AI hanya membaca konteks yang relevan.
- Fokus utama produk adalah menghasilkan **AI-Ready Project Context**, bukan sekadar dokumen.

Dengan pendekatan ini, ArroBuild akan memiliki diferensiasi yang lebih kuat, skalabilitas yang lebih baik, serta lebih siap menghadapi ekosistem AI Coding Agent modern.