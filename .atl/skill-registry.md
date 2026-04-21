# Skill Registry

## Loaded Skills

### branch-pr
- **Trigger**: "creating a pull request", "opening a PR", "preparing changes for review".
- **Compact Rules**:
> [!NOTE]
> - **Issue First**: Ensure an issue exists and is linked in the PR.
> - **Context**: Provide clear summary and testing evidence.
> - **Commits**: Use conventional commits (feat, fix, refactor).

### issue-creation
- **Trigger**: "creating a GitHub issue", "reporting a bug", "requesting a feature".
- **Compact Rules**:
> [!NOTE]
> - **Clarity**: Precise title and descriptive body.
> - **Acceptance Criteria**: Define exactly when the issue is closed.

### judgment-day
- **Trigger**: "judgment day", "review adversarial", "dual review", "juzgar".
- **Compact Rules**:
> [!NOTE]
> - **Adversarial**: Force agents to find flaws that standard reviews miss.
> - **Iterative**: Re-judge until both judges pass.

### skill-creator
- **Trigger**: "create a new skill", "add agent instructions", "document patterns for AI".
- **Compact Rules**:
> [!NOTE]
> - **Pattern**: Define triggers clearly, keep rules compact.
> - **Frontmatter**: Include name, description, version, allowed-tools.

### go-testing
- **Trigger**: "writing Go tests", "teatest", "Bubbletea TUI testing", "table-driven tests", "Go coverage".
- **Compact Rules**:
> [!NOTE]
> - **Table-Driven**: Always use table-driven tests for multiple cases.
> - **TUI**: Use teatest for Bubbletea component testing.
> - **Golden Files**: Use golden file pattern for complex output assertions.

## Project Standards (auto-resolved)

- **Monorepo Structure**: Keep `frontend/` and `backend/` decoupled. Communicate via REST/SSE.
- **Frontend**: React 19 + TypeScript + Tailwind 4. Use Vite for development.
- **Backend**: Flask + Whisper + Ollama Proxy. Keep it thin and stateless where possible.
- **Testing**: CURRENTLY DISABLED. Manual verification required for all changes until Vitest/Pytest are added.
