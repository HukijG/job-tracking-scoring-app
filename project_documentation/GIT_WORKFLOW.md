# Git Workflow & Development Process

## Repository Setup

### Initial Setup
```bash
# Initialize repository (if not already done)
git init

# Create .gitignore
cat > .gitignore << EOF
# Dependencies
node_modules/
.pnpm-store/

# Build outputs
build/
dist/
.svelte-kit/
.vercel/
.cloudflare/

# Environment variables
.env
.env.local
.env.production
.dev.vars

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Testing
coverage/

# Cloudflare
wrangler.toml.local
EOF

# Initial commit
git add .
git commit -m "Initial commit: Project documentation"

# Add remote (create GitHub/GitLab repo first)
git remote add origin <your-repo-url>
git push -u origin main
```

---

## Branch Strategy

### Main Branch
- `main` - Always deployable, production-ready code
- Protected: Requires reviewed changes
- All features merge here after testing

### Feature Branches
Create a new branch for every feature, bug fix, or significant change.

**Naming convention**:
- Features: `feature/short-description`
- Bug fixes: `fix/bug-description`
- Documentation: `docs/what-changed`
- Refactoring: `refactor/what-changed`

**Examples**:
- `feature/database-schema`
- `feature/scoring-api`
- `feature/dashboard-ui`
- `fix/webhook-signature-validation`
- `docs/update-deployment-guide`

---

## Development Workflow

### Starting a New Feature

1. **Ensure main is up to date**:
```bash
git checkout main
git pull origin main
```

2. **Create feature branch**:
```bash
git checkout -b feature/your-feature-name
```

3. **Work on the feature**:
- Make changes
- Test thoroughly
- Commit frequently with clear messages

4. **Commit changes**:
```bash
git add .
git commit -m "Descriptive commit message"
```

### Commit Message Guidelines

**Format**:
```
<type>: <short summary>

<optional detailed description>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Build process, dependencies
- `style`: Formatting, styling

**Examples**:
```
feat: Add job scoring API endpoints

Implemented POST /api/jobs/:id/score endpoint with validation,
score calculation, and rank assignment logic.

---

fix: Resolve webhook signature validation error

Corrected HMAC comparison to use constant-time equality check.

---

docs: Update SCORING_MODEL.md with finalized weights

Team agreed on 35% client engagement, 30% fee size.
```

### Completing a Feature

1. **Ensure all changes are committed**:
```bash
git status  # Should show clean working tree
```

2. **Push to remote**:
```bash
git push origin feature/your-feature-name
```

3. **Merge into main** (after testing):
```bash
git checkout main
git pull origin main
git merge feature/your-feature-name
git push origin main
```

4. **Delete feature branch** (optional, keeps repo clean):
```bash
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

---

## When to Commit & Branch

### Create New Branch When:
- Starting a new feature (e.g., dashboard UI, scoring API)
- Implementing a significant change (e.g., refactoring database layer)
- Fixing a bug that requires multiple changes
- Experimenting with a new approach

### Commit Frequently When:
- You've completed a logical unit of work (function, component, test)
- Before switching context or taking a break
- After fixing a bug (even small ones)
- Before attempting risky refactoring (so you can rollback)

### DO NOT Commit:
- Broken code (unless using WIP commits on feature branch)
- Secrets, API keys, credentials
- Large binary files (unless necessary)
- Generated files already in .gitignore

---

## Step-by-Step Feature Development Process

### 1. Plan the Feature
- Review documentation (FEATURES.md, DEVELOPMENT_ROADMAP.md)
- Identify all files that need changes
- Consider impacts on other parts of system

### 2. Create Feature Branch
```bash
git checkout main
git pull
git checkout -b feature/feature-name
```

### 3. Implement Feature
- Write code incrementally
- Test as you go (manual or automated)
- Commit logical chunks:
  ```bash
  git add <files>
  git commit -m "feat: implement X"
  ```

### 4. Test Thoroughly
- Unit tests (if applicable)
- Integration tests
- Manual testing in browser/Postman
- Test edge cases

### 5. Update Documentation
**IMPORTANT**: After feature is complete, update:
- [ ] `CLAUDE.md` - Add any architectural changes, patterns, gotchas
- [ ] `README.md` - Update if setup steps changed
- [ ] `DEVELOPMENT_ROADMAP.md` - Check off completed items
- [ ] Inline code comments - Document complex logic
- [ ] API documentation - If endpoints added/changed

### 6. Final Commit & Push
```bash
git add .
git commit -m "docs: update documentation for feature-name"
git push origin feature/feature-name
```

### 7. Merge to Main
```bash
git checkout main
git merge feature/feature-name
git push origin main
```

### 8. Sync & Clean Up
```bash
# Delete local branch
git branch -d feature/feature-name

# Delete remote branch (optional)
git push origin --delete feature/feature-name
```

---

## After Bug Fixes

### Workflow
1. Create branch: `git checkout -b fix/bug-description`
2. Fix the bug and test
3. Commit: `git commit -m "fix: description of what was fixed"`
4. **Update documentation if needed**:
   - If bug revealed a misconception, update architecture docs
   - If fix required workaround, document in CLAUDE.md
   - If fix changes behavior, update relevant .md files
5. Push and merge to main
6. Mark as resolved in any issue tracker

---

## Documentation Update Triggers

**Always update docs when**:
- [ ] Adding new API endpoints → Update API docs
- [ ] Changing database schema → Update DATA_ARCHITECTURE.md
- [ ] Modifying scoring logic → Update SCORING_MODEL.md
- [ ] Changing deployment process → Update DEPLOYMENT.md
- [ ] Discovering important patterns/gotchas → Update CLAUDE.md
- [ ] Completing roadmap milestones → Check off DEVELOPMENT_ROADMAP.md
- [ ] Fixing bugs that exposed design issues → Update relevant docs

---

## Pre-Push Checklist

Before pushing to `main`, ensure:
- [ ] Code works locally (tested)
- [ ] No console errors or warnings
- [ ] Environment variables documented
- [ ] Documentation updated (CLAUDE.md, README, etc.)
- [ ] Commit messages are clear and descriptive
- [ ] No secrets in code
- [ ] .gitignore is correct

---

## Rollback Procedure

If you need to undo recent changes:

### Undo last commit (keep changes):
```bash
git reset --soft HEAD~1
```

### Undo last commit (discard changes):
```bash
git reset --hard HEAD~1
```

### Revert a specific commit (safe for shared branches):
```bash
git revert <commit-hash>
```

### Go back to specific commit:
```bash
git checkout <commit-hash>
# If you want to keep this state:
git checkout -b recovery-branch
```

---

## Useful Git Commands

### See what changed:
```bash
git status                    # Current changes
git diff                      # Unstaged changes
git diff --staged             # Staged changes
git log --oneline             # Commit history
git log --graph --oneline     # Visual commit tree
```

### Branch management:
```bash
git branch                    # List local branches
git branch -a                 # List all branches (including remote)
git branch -d branch-name     # Delete local branch
git push origin --delete br   # Delete remote branch
```

### Syncing:
```bash
git fetch origin              # Download remote changes (don't merge)
git pull origin main          # Download and merge remote changes
git push origin branch-name   # Upload local changes
```

---

## Emergency: Recover Lost Work

### If you accidentally deleted uncommitted changes:
```bash
git reflog  # Shows all actions, find the commit before deletion
git checkout <commit-hash>
```

### If you committed to wrong branch:
```bash
git log  # Copy the commit hash
git checkout correct-branch
git cherry-pick <commit-hash>
```

---

## Summary: Golden Rules

1. **Always create a feature branch** before starting significant work
2. **Commit frequently** with clear messages
3. **Test before merging** to main
4. **Update documentation** after every feature/fix
5. **Keep main clean** - never push broken code
6. **Sync often** - pull from main regularly to avoid conflicts
7. **Delete old branches** - keep repo tidy
8. **Never commit secrets** - use environment variables

---

## Quick Reference

| Task | Command |
|------|---------|
| Start new feature | `git checkout -b feature/name` |
| Save progress | `git add . && git commit -m "message"` |
| Push to remote | `git push origin branch-name` |
| Merge to main | `git checkout main && git merge feature/name` |
| Update from remote | `git pull origin main` |
| See changes | `git status` and `git diff` |
| View history | `git log --oneline` |
| Undo last commit (keep changes) | `git reset --soft HEAD~1` |
