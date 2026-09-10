# Antigravity Kit Architecture

> Comprehensive AI Agent Capability Expansion Toolkit

---

## 📋 Overview

Antigravity Kit is a modular system consisting of:

- **20 Specialist Agents** — Role-based AI personas
- **32 Skills** — Domain-specific knowledge modules (+ 10 archived)
- **22 Workflows** — 6 local + 16 global slash commands

---

## 🏗️ Directory Structure

```plaintext
.agent/
├── ARCHITECTURE.md          # This file
├── agents/                  # 20 Specialist Agents
├── skills/                  # 32 Active Skills (+ .archive/ with 10 archived)
├── workflows/               # 6 Local Workflows
├── rules/                   # Global Rules
└── scripts/                 # Master Validation Scripts
```

---

## 🤖 Agents (20)

Specialist AI personas for different domains.

| Agent                    | Focus                      | Skills Used                                                          |
| ------------------------ | -------------------------- | -------------------------------------------------------------------- |
| `orchestrator`           | Multi-agent coordination   | `intelligent-routing`, `brainstorming`                               |
| `project-planner`        | Discovery, task planning   | `brainstorming`, `plan-writing`, `architecture`                      |
| `frontend-specialist`    | Web UI/UX                  | `frontend-design`, `nextjs-react-expert`, `tailwind-patterns`, `shadcn-ui` |
| `backend-specialist`     | API, business logic        | `api-patterns`, `nodejs-best-practices`, `express-patterns`, `swagger-openapi` |
| `database-architect`     | Schema, data modeling      | `database-design`, `mongodb-patterns`, `redis-patterns`              |
| `mobile-developer`       | iOS, Android, RN           | *(skills archived — uses general React Native knowledge)*            |
| `game-developer`         | Game logic, mechanics      | *(skills archived — uses general programming knowledge)*             |
| `devops-engineer`        | CI/CD, containers          | `deployment-procedures`, `docker-nginx`, `ubuntu-vps`                |
| `security-auditor`       | Security compliance        | `vulnerability-scanner`                                              |
| `penetration-tester`     | Offensive security         | `vulnerability-scanner`                                              |
| `test-engineer`          | Testing strategies         | `testing-patterns`, `webapp-testing`                                 |
| `debugger`               | Root cause analysis        | `systematic-debugging`                                               |
| `performance-optimizer`  | Speed, Web Vitals          | `performance-profiling`                                              |
| `seo-specialist`         | Ranking, visibility        | `seo-fundamentals`                                                   |
| `documentation-writer`   | Manuals, docs              | `documentation-templates`                                            |
| `product-manager`        | Requirements, user stories | `plan-writing`, `brainstorming`                                      |
| `product-owner`          | Strategy, backlog, MVP     | `plan-writing`, `brainstorming`                                      |
| `qa-automation-engineer` | E2E testing, CI pipelines  | `webapp-testing`, `testing-patterns`                                 |
| `code-archaeologist`     | Legacy code, refactoring   | `clean-code`, `code-review-checklist`                                |
| `explorer-agent`         | Codebase analysis          | —                                                                    |

---

## 🧩 Skills (32)

Modular knowledge domains that agents can load on-demand, based on task context.

> ⚠️ **Archived (10):** game-development, mobile-design, rust-pro, python-patterns, powershell-windows, red-team-tactics, geo-fundamentals, mcp-builder, parallel-agents, tdd-workflow — moved to `.agent/skills/.archive/`.

### Frontend & UI

| Skill                   | Description                                                            |
| ----------------------- | ---------------------------------------------------------------------- |
| `nextjs-react-expert`   | React & Next.js performance optimization from Vercel Engineering        |
| `web-design-guidelines` | Web UI audit — 100+ rules for accessibility, UX, performance (Vercel)  |
| `tailwind-patterns`     | Tailwind CSS v4 utilities, container queries, design tokens            |
| `frontend-design`       | UI/UX patterns, design systems, emotion mapping                        |
| `shadcn-ui`             | shadcn/ui component patterns, theming, forms, composition              |

### Backend & API

| Skill                   | Description                     |
| ----------------------- | ------------------------------- |
| `api-patterns`          | REST, GraphQL, tRPC design       |
| `nodejs-best-practices` | Node.js async, modules          |
| `express-patterns`      | Express.js router, EJS, middleware |
| `swagger-openapi`       | OpenAPI 3.0, Swagger docs        |

### Database & Caching

| Skill               | Description                                   |
| ------------------- | --------------------------------------------- |
| `database-design`   | Schema design, indexing strategy              |
| `mongodb-patterns`  | Mongoose schema, aggregation, indexing        |
| `redis-patterns`    | Cache-aside, sessions, rate limiting, pub/sub |

### Cloud & Infrastructure

| Skill                   | Description                         |
| ----------------------- | ----------------------------------- |
| `deployment-procedures` | CI/CD, deploy workflows             |
| `server-management`     | Infrastructure management           |
| `docker-nginx`          | Docker, Compose, Nginx reverse proxy |
| `ubuntu-vps`            | VPS setup, UFW, PM2, SSL, monitoring |

### Testing & Quality

| Skill                   | Description                       |
| ----------------------- | --------------------------------- |
| `testing-patterns`      | Jest, Vitest — unit & integration |
| `webapp-testing`        | E2E, Playwright                   |
| `code-review-checklist` | Code review standards             |
| `lint-and-validate`     | Linting, type checking            |

### Security

| Skill                   | Description              |
| ----------------------- | ------------------------ |
| `vulnerability-scanner` | Security auditing, OWASP |

### Architecture & Planning

| Skill                 | Description                         |
| --------------------- | ----------------------------------- |
| `architecture`        | System design, ADR documentation    |
| `plan-writing`        | Task planning, phase breakdown      |
| `brainstorming`       | Socratic questioning protocol       |
| `intelligent-routing` | Auto agent selection & task routing |

### SEO

| Skill              | Description                   |
| ------------------ | ----------------------------- |
| `seo-fundamentals` | SEO, E-E-A-T, Core Web Vitals |

### Other

| Skill                     | Description                    |
| ------------------------- | ------------------------------ |
| `clean-code`              | Coding standards (Global)      |
| `documentation-templates` | Doc formats & templates        |
| `i18n-localization`       | Internationalization patterns  |
| `performance-profiling`   | Web Vitals, bundle optimization |
| `systematic-debugging`    | 4-phase debugging methodology  |
| `skill-creator`           | Guide to creating new skills   |

---

## 🔄 Workflows (22)

Slash command procedures. **Local** workflows (`.agent/workflows/`) take precedence over **Global** (AWF) when commands share the same name.

### Local Workflows (Project-Specific)

| Command          | Description                     |
| ---------------- | ------------------------------- |
| `/code`          | Write code from spec/phase      |
| `/plan`          | Feature & project planning      |
| `/recap`         | Restore session context         |
| `/refactor`      | Refactor & clean up code        |
| `/save-brain`    | Persist session to `.brain/`    |
| `/ui-ux-pro-max` | Design with 50+ styles          |

### Global Workflows (AWF)

| Command              | Description                  |
| -------------------- | ---------------------------- |
| `/init`              | Initialize new project       |
| `/brainstorm`        | Socratic discovery           |
| `/design`            | Technical design             |
| `/visualize`         | UI/UX mockup                 |
| `/run`               | Run the application          |
| `/debug`             | Debug issues                 |
| `/test`              | Run test suite               |
| `/audit`             | Security & code audit        |
| `/deploy`            | Deploy to production         |
| `/next`              | Suggest next steps           |
| `/review`            | Project review & handover    |
| `/rollback`          | Rollback deployment          |
| `/customize`         | Personalize AI behavior      |
| `/help`              | Context-aware help           |
| `/awf-update`        | Update AWF framework         |
| `/cloudflare-tunnel` | Manage Cloudflare tunnel     |

---

## 🎯 Skill Loading Protocol

```plaintext
User Request → Skill Description Match → Load SKILL.md
                                            ↓
                                    Read references/
                                            ↓
                                    Read scripts/
```

### Skill Structure

```plaintext
skill-name/
├── SKILL.md           # (Required) Metadata & instructions
├── scripts/           # (Optional) Python/Bash scripts
├── references/        # (Optional) Templates, docs
└── assets/            # (Optional) Images, logos
```

### Enhanced Skills (with scripts/references)

| Skill               | Files | Coverage                          |
| ------------------- | ----- | --------------------------------- |
| `frontend-design`   | 4+    | Color system, animations, motion  |
| `vulnerability-scanner` | 2+ | Security scripts + dependency scan |

---

## 📜 Scripts (2)

Master validation scripts that orchestrate skill-level scripts.

### Master Scripts

| Script          | Purpose                                 | When to Use              |
| --------------- | --------------------------------------- | ------------------------ |
| `checklist.py`  | Priority-based validation (Core checks) | Development, pre-commit  |
| `verify_all.py` | Comprehensive verification (All checks) | Pre-deployment, releases |

### Usage

```bash
# Quick validation during development
python .agent/scripts/checklist.py .

# Full verification before deployment
python .agent/scripts/verify_all.py . --url http://localhost:3000
```

### What They Check

**checklist.py** (Core checks):

- Security (vulnerabilities, secrets)
- Code Quality (lint, types)
- Schema Validation
- Test Suite
- UX Audit
- SEO Check

**verify_all.py** (Full suite):

- Everything in checklist.py PLUS:
- Lighthouse (Core Web Vitals)
- Playwright E2E
- Bundle Analysis
- Mobile Audit
- i18n Check

For details, see [scripts/README.md](scripts/README.md)

---

## 📊 Statistics

| Metric              | Value                          |
| ------------------- | ------------------------------ |
| **Total Agents**    | 20                             |
| **Total Skills**    | 32 (+ 10 archived)             |
| **Total Workflows** | 22 (6 local + 16 global)       |
| **Total Scripts**   | 4 (master) + 12 (skill-level)  |
| **Coverage**        | ~95% modern web stack          |

---

## 🎯 Skill Routing (When to Use Which)

| Scenario | Skill |
| -------- | ----- |
| Designing UI layout/colors | `frontend-design` |
| Auditing existing UI | `web-design-guidelines` |
| Implementing with Tailwind | `tailwind-patterns` |
| Building React/Next.js | `nextjs-react-expert` |
| **shadcn/ui components** | **`shadcn-ui`** |
| Unit / integration tests | `testing-patterns` |
| E2E browser tests | `webapp-testing` |
| REST/GraphQL API design | `api-patterns` |
| **Express routes/middleware** | **`express-patterns`** |
| **EJS templates** | **`express-patterns`** |
| **API documentation** | **`swagger-openapi`** |
| **MongoDB / Mongoose** | **`mongodb-patterns`** |
| **Redis caching/sessions** | **`redis-patterns`** |
| **Docker / Compose** | **`docker-nginx`** |
| **Nginx reverse proxy** | **`docker-nginx`** |
| **VPS setup / security** | **`ubuntu-vps`** |
| **PM2 / SSL / monitoring** | **`ubuntu-vps`** |
| Auto agent selection | `intelligent-routing` |
| Security audit (defender) | `vulnerability-scanner` |
| Database schema design | `database-design` |

---

## 🔗 Quick Reference

| Need     | Agent                 | Skills                                        |
| -------- | --------------------- | --------------------------------------------- |
| Web App  | `frontend-specialist` | nextjs-react-expert, frontend-design          |
| API      | `backend-specialist`  | api-patterns, nodejs-best-practices           |
| Mobile   | `mobile-developer`    | mobile-design                                 |
| Database | `database-architect`  | database-design                               |
| Security | `security-auditor`    | vulnerability-scanner                         |
| Testing  | `test-engineer`       | testing-patterns, webapp-testing              |
| Debug    | `debugger`            | systematic-debugging                          |
| Plan     | `project-planner`     | brainstorming, plan-writing                   |
| Rust     | `backend-specialist`  | rust-pro                                      |
