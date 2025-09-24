# Repository Merger Plan: Merge SDSA.team INTO SDSA

## Overview

This document outlines the plan to merge the SDSA.team contexts repository into the SDSA application repository, creating a unified open-source project. The SDSA repository will become public and host both the application and questionnaire content.

**Key Architecture Change:** Since React Native supports hot reload/OTA updates (e.g., via CodePush or similar), questionnaires will be bundled with the app rather than fetched dynamically from GitHub. This simplifies the architecture and removes the need for external content loading.

## Current State

### SDSA Repository (Private → Will become Public)
- **Location**: `/Users/eugene/git/sdsa`
- **Purpose**: React Native application source code
- **Key Contents**:
  - Complete React Native/Expo app with TypeScript
  - Multi-platform support (iOS, Android, Web)
  - Services for questionnaires, AI integration, caching
  - Tests, CI/CD configuration
  - Development documentation (CLAUDE.md, README.md)

### SDSA.team Repository (Public → Will be archived)
- **Location**: `/Users/eugene/git/sdsa.team`
- **URL**: `https://github.com/eugene-taran/sdsa.team`
- **Purpose**: Open-source questionnaire content
- **Key Contents**:
  - `/contexts` - Questionnaires and categories
  - `/scripts` - Release automation
  - Documentation (README.md, CLAUDE.md)
  - GitHub Actions workflows

## Merger Strategy: Fresh Start (No History Preservation)

Simple copy of sdsa.team content into the SDSA repository without git history, then make SDSA public.

**Advantages**:
- Simple and fast process
- No risk of exposing sensitive commits
- Clean start for open-source
- Easy to review what's being made public

**Approach**:
1. Copy content from sdsa.team into sdsa
2. Review and clean any sensitive data
3. Make sdsa repository public
4. Archive sdsa.team repository

## Pre-Merger Checklist

### Security Audit (Critical)
- [ ] Remove all `.env` files and ensure they're gitignored
- [ ] Remove any hardcoded API keys, tokens, or credentials
- [ ] Check iOS/Android configuration files for certificates/keys
- [ ] Review package.json for private registry tokens
- [ ] Verify no private URLs or internal endpoints

### Content Preparation
- [ ] Ensure LICENSE file exists (MIT recommended)
- [ ] Update README.md for public audience
- [ ] Remove any internal documentation
- [ ] Add CONTRIBUTING.md guidelines

## Merger Steps

### Phase 1: Preparation

1. **Create backup of both repositories**
   ```bash
   cd ~/git
   cp -r sdsa sdsa-backup-$(date +%Y%m%d)
   cp -r sdsa.team sdsa.team-backup-$(date +%Y%m%d)
   ```

2. **Clean sensitive data from SDSA repo**
   ```bash
   cd ~/git/sdsa
   # Remove .env files
   rm -f .env .env.local .env.production
   # Ensure they're in .gitignore
   echo ".env*" >> .gitignore
   ```

### Phase 2: Copy Content from SDSA.team

1. **Copy contexts folder**
   ```bash
   cd ~/git/sdsa
   cp -r ~/git/sdsa.team/contexts ./
   ```

2. **Copy useful scripts**
   ```bash
   # Review and copy any useful scripts
   cp -r ~/git/sdsa.team/scripts ./scripts-from-team
   # Later merge with existing scripts folder
   ```

3. **Merge documentation**
   - Take relevant sections from sdsa.team's README.md
   - Combine CLAUDE.md files (if both have useful content)
   - Copy any other documentation

4. **Update QuestionnaireService**
   - Remove GitHub fetching logic
   - Update to import questionnaires directly from local contexts folder
   - Remove caching logic (no longer needed with local files)
   - Simplify service to just read local JSON files

### Phase 3: Update Repository Structure

**Final structure:**
```
sdsa/ (unified repository)
├── src/                   # Application source
├── android/               # Android native code
├── ios/                   # iOS native code
├── contexts/              # Questionnaires (from sdsa.team)
│   ├── categories.json
│   └── categories/
├── scripts/               # Build and utility scripts
├── docs/                  # Documentation
├── .github/               # GitHub Actions
├── README.md             # Public-facing README
├── CLAUDE.md             # AI assistant context
├── CONTRIBUTING.md       # Contribution guidelines
└── LICENSE               # MIT license
```

### Phase 4: Final Preparation

1. **Update README.md**
   ```bash
   # Combine best parts of both READMEs
   # Focus on:
   # - Clear project description
   # - Installation instructions
   # - How to contribute questionnaires
   # - How to run the app
   ```

2. **Add attribution**
   - Credit sdsa.team contributors
   - Mention the merger in README

3. **Test everything**
   ```bash
   yarn install
   yarn lint
   yarn test
   yarn build
   ```

### Phase 5: Make Repository Public

1. **Final security check**
   ```bash
   # Search for common sensitive patterns
   grep -r "API_KEY\|SECRET\|TOKEN\|PASSWORD" --exclude-dir=node_modules .
   ```

2. **Create a clean commit**
   ```bash
   git add .
   git commit -m "Merge sdsa.team contexts into main repository"
   ```

3. **Make SDSA repository public on GitHub**
   - Go to Settings → Change visibility → Make public
   - Add description: "AI-powered development assistance through context-aware conversations"
   - Add topics: react-native, expo, ai, llm, questionnaire

4. **Archive sdsa.team repository**
   - Add notice in README pointing to new location
   - Archive the repository on GitHub

## Post-Merger Tasks

1. **Update references**
   - Update any URLs pointing to sdsa.team repo
   - Update CI/CD configurations
   - Remove questionnaire fetching logic from services
   - Update imports to use local contexts

2. **Community setup**
   - Create issue templates for bugs and questionnaire contributions
   - Add CONTRIBUTING.md with clear guidelines
   - Set up GitHub discussions for Q&A

3. **Redirect users**
   - Update sdsa.team README with link to new location
   - Consider GitHub redirect if deleting old repo

## Quick Execution Guide

```bash
# Step 1: Backup
cd ~/git
cp -r sdsa sdsa-backup-$(date +%Y%m%d)
cp -r sdsa.team sdsa.team-backup-$(date +%Y%m%d)

# Step 2: Clean sensitive files
cd ~/git/sdsa
rm -f .env .env.local .env.production
git rm --cached .env .env.local .env.production 2>/dev/null || true

# Step 3: Copy contexts
cp -r ~/git/sdsa.team/contexts ./

# Step 4: Update QuestionnaireService to use local contexts
# Update src/services/questionnaireService.ts to import from '../contexts'
# Remove fetch logic and use direct imports

# Step 5: Security check
grep -r "API_KEY\|SECRET\|TOKEN\|PASSWORD" --exclude-dir=node_modules .

# Step 6: Test with local contexts
yarn test
yarn lint
yarn build

# Step 7: Commit changes
git add .
git commit -m "Merge sdsa.team contexts into main repository

- Added questionnaire contexts from sdsa.team
- Switched from dynamic loading to bundled contexts
- Prepared for open-source release
- Combined documentation"

# Step 8: Push and make public on GitHub
git push origin main
# Then go to GitHub Settings → Make repository public
```

## Timeline

- **Day 1**: Security audit, remove sensitive data, copy contexts
- **Day 2**: Update documentation, test everything
- **Day 3**: Make repository public, archive old repo

## Success Criteria

- [ ] All sensitive data removed
- [ ] Contexts successfully copied and bundled with app
- [ ] QuestionnaireService updated to use local contexts
- [ ] No external fetching of questionnaires
- [ ] Tests passing with local contexts
- [ ] Repository made public
- [ ] Old repository archived with redirect notice

## Rollback Plan

If issues arise after making public:
1. Immediately make repository private again
2. Fix any security issues
3. Use backup to restore if needed

## Resources

- [GitHub: Making a repository public](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility)
- [GitHub: Archiving repositories](https://docs.github.com/en/repositories/archiving-a-github-repository)