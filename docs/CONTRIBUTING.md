# Contributing Guidelines

Welcome to the Rose of Sharon Management System project. This document explains how the team collaborates using Git and GitHub.

## Branch Strategy

| Branch | Purpose | Who merges |
|--------|---------|-----------|
| `main` | Production-ready code. Stable. | Maintainer only, from `develop` |
| `develop` | Active integration branch | Maintainer only, from feature branches |
| `feature/*` | New features | Developer who created it |
| `fix/*` | Bug fixes | Developer who created it |

## Naming Conventions

### Branches

Use descriptive, hyphenated names with a prefix:

- `feature/auth-login` — New login feature
- `feature/member-export` — New member export
- `fix/sidebar-overflow` — Bug fix
- `chore/update-dependencies` — Maintenance task

### Commit Messages

Keep messages short, clear, and in the imperative mood:

- Good: `Add SMS template list page`
- Good: `Fix pagination on members table`
- Good: `Update member type to include group field`
- Avoid: `did some work`, `fixes`, `wip`

## Daily Workflow

### 1. Start your day — pull latest

```bash
git checkout develop
git pull origin develop
```

### 2. Create a new branch for your task

```bash
git checkout -b feature/your-task-name
```

### 3. Do your work

Edit files, test locally.

### 4. Stage, commit, push

```bash
git add <specific files>
git commit -m "Short clear message"
git push origin feature/your-task-name
```

Tip: prefer `git add <file1> <file2>` over `git add .` — it prevents accidental commits of `.env`, secrets, or unrelated changes.

### 5. Open a Pull Request

- Go to GitHub → your repo
- Click **"Compare & pull request"**
- Base: `develop`, Compare: `feature/your-task-name`
- Write a clear PR description: what does it do, how to test
- Request a review

### 6. Address review feedback

```bash
# Make changes locally, then:
git add <files>
git commit -m "Address review feedback: <what you fixed>"
git push origin feature/your-task-name
```

### 7. After merge

```bash
git checkout develop
git pull origin develop
git branch -d feature/your-task-name
```

## Rules

### MUST

- ✅ Always branch from latest `develop`
- ✅ Open a Pull Request for every change
- ✅ Request at least one review before merging
- ✅ Keep branches focused — one feature/fix per branch
- ✅ Run the build locally before pushing (`npm run build`)

### MUST NOT

- ❌ Never push directly to `main` or `develop`
- ❌ Never commit `.env` files, API keys, or passwords
- ❌ Never commit `node_modules/` or build output
- ❌ Never force-push to shared branches
- ❌ Never merge your own PR without review

## Setup

### First-time setup

```bash
# Clone the repo
git clone https://github.com/ajiboyesunkanmisunday-rgb/Rose-of-Sharon-Management-System.git
cd Rose-of-Sharon-Management-System

# Switch to develop
git checkout develop

# Install frontend dependencies
cd frontend
npm install
```

### Running the frontend locally

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Building for production

```bash
cd frontend
npm run build
```

## Getting Help

If you get stuck on a git task, ask in the team chat — don't force-push or make drastic changes without checking.
