# Complete Guide to Claude Code

---

## Table of Contents

- [File Structure](#file-structure)
- [How to Configure](#how-to-configure)
  - [Globally (Recommended)](#globally-recommended)
  - [Per Project](#per-project)
  - [How to Disable Mentions in Commits](#how-to-disable-mentions-in-commits)
  - [Enabling skill-creator](#enabling-skill-creator)
- [How to Save Tokens](#how-to-save-tokens)
  - [Use Subscription, Not API Tokens](#use-subscription-not-api-tokens)
- [How It Works](#how-it-works)
  - [Claude Code](#claude-code)
    - [Continue](#continue)
    - [Resume](#resume)
    - [Auto-Accept Permissions](#auto-accept-permissions)
  - [CLAUDE.md](#claudemd)
    - [Customizing Your CLAUDE.md (Optional)](#customizing-your-claudemd-optional)
  - [Skills](#skills)
  - [Commands](#commands)
    - [How I Like to Use](#how-i-like-to-use)
  - [Hooks](#hooks)
- [Connecting the Dots](#connecting-the-dots)
  - [Flow Without Planning](#flow-without-planning)
  - [Slow and Steady Wins the Race](#slow-and-steady-wins-the-race)
  - [Staged vs Unstaged](#staged-vs-unstaged)
- [Saving Context](#saving-context)
  - [Don't Use Terminal Mode](#dont-use-terminal-mode)
- [Parallelizing Work](#parallelizing-work)
  - [Git Worktrees](#git-worktrees)
  - [Tmux](#tmux)
- [Hooks](#hooks-1)
  - [Notification](#notification)
- [Commands](#commands-1)
  - [/new-feat](#new-feat)
  - [/review](#review)
  - [/open-pr](#open-pr)
- [MCP Servers](#mcp-servers)
  - [Context7](#context7)
    - [Installation](#installation)
  - [Playwright](#playwright)

---

## File Structure

```
/.claude/
├─ CLAUDE.md
├─ commands/
│  ├─ new-feat.md
│  ├─ review.md
│  └─ open-pr.md
├─ skills/
│  ├─ coding-guidelines/
│  ├─ copywriting/
│  ├─ planning/
│  ├─ review-changes/
│  └─ writing/
└─ hooks/
   └─ notification.sh
```

---

## How to Configure

### Globally (Recommended)

Move the `.claude` folder to Claude Code's global location: `~/.claude` or `$HOME/.claude`.

This makes the rules, commands, and skills available for any conversation with Claude Code.

```bash
cd $HOME
mkdir .claude
cp -r $HOME/Downloads/.claude .claude/
```

### Per Project

By copying the `.claude` folder to your project's root, the rules, commands, and skills will only be available for that project.

```bash
cd your-project
mkdir .claude
cp -r ~/Downloads/.claude .claude/
```

### How to Disable Mentions in Commits

Controlled by the `includeCoAuthoredBy: false` property in the `settings.json` file.

```json
{
  "includeCoAuthoredBy": false
}
```

**Before:**
```
Add user authentication

🤖 Generated with Claude Code
```

**After:**
```
Add user authentication
```

> **NOTE:** This setting is already applied in the `settings.json` from the zip

---

### Enabling `skill-creator`

Allows creating skills on demand during conversations.

#### **Step 1:** Access the [capabilities settings](https://claude.ai/settings/capabilities)

![Screenshot: Anthropic Dashboard - Settings button in bottom left corner](./capabilities.jpeg)

#### **Step 2:** Scroll to "Skills" and enable "skill-creator"

![Screenshot: Capabilities Dashboard - Skills Section](./habilidades.jpeg)

**How to use:**
```
You: Create a skill for {{ language you use }} programming, following {{ team, company or individual rules }},
Claude: [Automatically creates skill in ~/.claude/skills/]
```

---

## How to Save Tokens

### Use Subscription, Not API Tokens

| Plan | Cost | Features | When to Use |
|------|------|----------|-------------|
| **API** | $3/million input tokens<br>$15/million output tokens | Average cost: $80-200/month<br>(R$400 to R$1,000) | Production automation<br>CI/CD pipelines<br>Sporadic use (<10h/month) |
| **Pro** | $20/month | Priority during peak hours<br>Savings: 75-90% vs API<br>Daily/weekly usage limit | **RECOMMENDED: Daily development** |
| **Max** | $100/month | 5x more limit than Pro<br>Rarely hits limit | Very intensive use<br>(consider 2 Pro accounts first) |

**Recommendation:** Daily development = Pro Subscription

---

## How It Works

### Claude Code

To open the application, simply type `claude` in the terminal.

#### Continue

```bash
claude --continue
```

Runs from where the last conversation stopped.

#### Resume

```bash
claude --resume
```

Runs with a list of past conversations for you to choose which one to resume.

#### Auto-Accept Permissions

```bash
claude --dangerously-skip-permissions
```

Runs Claude with permission to edit files and run commands.

> **WARNING:** Use with caution, at your own risk, but it's useful to avoid accepting edits constantly.

---

### CLAUDE.md

Loaded at every conversation start. Can be created through the `/init` command inside Claude Code (it analyzes your project code and builds a summary with: tech stack, folder structure, and implementation patterns).

#### Customizing Your CLAUDE{.}md (Optional)

A good way to provide more individual context for your project is to run the `init` command and merge the result with the Claude.md from this guide, so you benefit from software engineering, accessibility, testing, naming, and writing best practices, but adapted to your _stack_.

---

### Skills

Rules/attributes available to Claude Code that are loaded only when needed.

**Saves tokens.**

> **WARNING:** By default, the CLAUDE.md file in the folder is minimal (using Skills to save tokens). Although useful and functional, if you have problems with Claude not following the rules, it's worth renaming CLAUDE.md → CLAUDE-min.md and CLAUDE-verbose.md to CLAUDE.md.

**Comparison:**

| Approach | Size | Description |
|----------|------|-------------|
| **Without skills** | CLAUDE-verbose.md: 1,003 tokens | All rules in main file |
| **With skills** | CLAUDE.md: 119 tokens | Basic rules + skills loaded on demand |

---

### Commands

Automate tasks, can communicate with MCPs and run commands in your terminal.

#### How I Like to Use

```bash
/new-feat {task description}
```

Generates a new branch from _main_, plans the task using code guidelines, executes, and leaves changes _staged_.

```bash
/review
```

Reviews the changes made and suggests improvements.

I apply the improvements, asking to leave them _unstaged_, so I can compare both versions (implementation + improvement suggestion)

```bash
/pr
```

Commits changes atomically, using _conventional commits_, pushes, and opens a PR using the following template:

```markdown
# What and why?
{1 Line: What's the most important information about this change?}

{3 Lines: How was it implemented and why is it necessary?}

# Changes
{Describe the changes concisely}

# Security
{Are there any security concerns or edge cases that deserve attention?}

# References
{Include documentation, articles, or book references to enrich the context of this PR.}
```

---

### Hooks

Scripts executed when completing tasks.

I only use the _Notification_ hook to play the Duolingo success sound when finishing a task.

This helps not to get stuck staring at the terminal, waiting for the AI to do my work.

**notification.sh:**
```bash
#!/bin/bash

on_tool_complete() {
  afplay ~/duolingo-success.mp3
}
```

**Result:** Sound when Claude finishes writing/editing files.

---

## Connecting the Dots

In the morning, write down 1-3 pending tasks in a notepad.

For each one, spend 5 minutes thinking about what needs to be done and +5 to write everything you know about the task, business rule details, system particularities, minimum requirements, technologies to be used, design pattern to be applied (if exists).

Write everything continuously in the notepad, below the title, take a 2-minute break, re-read, adjust, and open Claude Code.

**Recommended workflow:**

1. Press _Shift + Tab_ to activate _Plan_ mode
2. Paste the text and add references to files/folders related to the functionality using `@` + file path
3. Wait for the plan to be ready → review it (change it with `ctrl + g` if necessary)
4. Once the plan is finalized, let Claude execute it with `bypass permissions` (at your own risk)
5. When finished, test manually to see if it works
6. If it errors, copy and paste the error message in the chat, iterate until acceptable
7. Once changes are finalized, use the `/review` command to ensure no important concepts were left behind in the implementation
8. This command will generate some suggestions, read them and apply those that make sense
9. Once suggestions are applied, it's time to run `/pr` (will commit changes and open a pull request)

### Workflow Without Planning

If you don't want to use planning mode, just use the `/new-feat` command + description. It will create a new _feature branch_ and implement the changes.

### Slow and Steady Wins the Race

After the first "lap" of the day, I recommend making small iterations instead of long functionalities. I also recommend closing and starting conversations frequently, in order to save context.

### Staged vs Unstaged

A good _pre-review_ strategy is to leave changes in _staged (git)_ and ask Claude to apply improvements, but leave them in _unstaged_, so you can compare the two.

---

## Saving Context

### Don't Use Terminal Mode

**AVOID:**
```
You: Run npm test
Claude: [Executes and shows 200 lines]
```
**Cost:** 500 tokens per execution.

**PREFER:**
```bash
# In another terminal
npm test

# If it errors, copy only the relevant line
# ✗ Expected 'user' to be defined
```
**Cost:** 20 tokens.

---

## Parallelizing Work

### Git Worktrees

Work on multiple features simultaneously.

With Git Worktrees, you can maintain multiple versions of your repository (each on a branch), making it possible to run a Claude Code instance in each folder.

**Example:**

```bash
# Feature 1
cd project-main
git worktree add ../project-oauth -b feat/oauth
cd ../project-oauth
claude
# Claude works here


# In another terminal/window/session
cd project-main
git worktree add ../project-payment -b feat/payment
cd ../project-payment
claude
# Claude works here
```

Two folders, two branches, zero conflicts.

---

### Tmux

![TMUX - 4 windows](./tmux.jpeg)

It's a terminal multiplexer, allows opening multiple windows in 1 single _shell_.

It's an excellent tool, changed my life, but somewhat complex to teach how to configure and use via text, I recommend watching visual tutorials on how to configure it on your operating system.

---

## Hooks

### Notification

**Duolingo Sound:**

```bash
#!/bin/bash
# ~/.claude/hooks/notification.sh

on_tool_complete() {
  afplay ~/Downloads/duolingo-success.mp3
}
```

---

## Commands

### /new-feat

Creates branch + develops feature.

**Usage:**
```
/new-feat Add user profile page
```

**What it does:**
1. Creates `feat/add-user-profile-page`
2. Plans architecture
3. Implements code
4. Adds tests
5. Commits with descriptive message

**When to use:** New features from scratch.

---

### /review

Reviews staged code.

**Usage:**
```bash
git add src/auth.ts
/review
```

**Analyzes:**
- Type safety
- CLAUDE.md patterns
- Security (OWASP)
- Performance
- Accessibility

**When to use:** Before committing.

---

### /open-pr

Creates pull request.

**Usage:**
```
/open-pr Add OAuth authentication
```

**Generates:**
```markdown
## Summary
- Integrates Google OAuth
- Adds session management
- Implements refresh tokens

## Test Plan
- [ ] Login with Google works
- [ ] Session persists
- [ ] Logout clears session
```

**When to use:** Feature ready for review.

---

## MCP Servers

_Model Context Protocol Servers_ is an extensive subject, but they function as "arms" for Claude Code, making it possible to communicate with external tools.

There are MCPs for database access, browser control, GitHub, Terraform, Figma, etc. It's worth researching MCPs for the tools you use, if you want to integrate them with Claude Code.

I like to use few.

---

### Context7

Searches for updated documentation of libraries/languages and returns it as context for AI.

> **CAUTION:** Can consume your limits very quickly, because some documentation is quite extensive.

Access the website: [context7.com](https://context7.com/) to see the size of each documentation.

#### Installation

```bash
claude mcp add context7 -- npx -y @upstash/context7-mcp --api-key {API_KEY}
```

**Example:**
```
You: Use context7 mcp to learn more about Next.js 14 App Router?
Claude: [Searches official docs via Context7]
Claude: In Next.js 14, use 'use server' for...
```

Updated information. No outdated responses.

---

### Playwright

Automated E2E testing / Browser automation.

**Example:**
```
You: Create E2E test for login
Claude: [Generates via Playwright MCP]
```

```typescript
test('user login', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name=email]', 'test@example.com')
  await page.fill('[name=password]', 'password123')
  await page.click('button[type=submit]')
  await expect(page).toHaveURL('/dashboard')
})
```

Claude runs the test and validates automatically.

That's all for today, hope you enjoyed it!

Any questions, my DM on Twitter is always open: @ocodista
