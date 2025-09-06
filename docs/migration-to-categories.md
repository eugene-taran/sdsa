# Migration to Categories and Questionnaires

## Overview

This document outlines the migration from the old knowledge blocks system to the new category-based questionnaire structure used in the sdsa.team repository.

## New Structure

### Content Organization
```
contexts/
├── categories.json          # Category metadata
└── categories/             # Category folders
    ├── cicd/              # CI/CD category
    │   └── cicd-pipeline.json
    └── e2e/               # Testing category
        └── e2e-testing.json
```

### Data Models

#### Category
```typescript
interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  path: string;
  order: number;
}
```

#### Questionnaire
```typescript
interface Questionnaire {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  llmConfig: LLMConfig;
  metadata?: {
    author?: string;
    version?: string;
    estimatedTime?: string;
  };
}
```

#### Question Types
```typescript
interface Question {
  type: 'radio' | 'checkbox' | 'text' | 'textarea';
  label: string;
  placeholder?: string;
  options?: Option[];
}

interface Option {
  value: string;
  label: string;
  hasTextInput?: boolean;
  textInputPlaceholder?: string;
}
```

## UI Changes

### Navigation Flow
```
HomeScreen (Categories) 
    ↓
CategoryScreen (Questionnaires)
    ↓
QuestionnaireScreen (Questions)
    ↓
ChatScreen (AI Assistant)
```

### Screen Updates

#### HomeScreen
- Display category cards with:
  - Icon (emoji)
  - Name
  - Description
  - Number of questionnaires
- Grid or list layout
- Tap to navigate to category

#### CategoryScreen (New)
- Show questionnaires within category
- List view with:
  - Title
  - Description
  - Estimated time
  - Author
- Tap to start questionnaire

#### QuestionnaireScreen
- Support all question types
- Handle custom text input options
- Progress indicator
- Back navigation

## Implementation Steps

### 1. Copy Content
```bash
# Copy categories and questionnaires
cp -r ~/git/sdsa.team/contexts assets/
```

### 2. Update Types
- Create `src/types/category.ts`
- Update `src/types/questionnaire.ts`
- Remove old knowledge types

### 3. Update Services
- Modify `questionnaireService.ts`:
  - Load categories.json first
  - Fetch questionnaires by category
  - Update caching logic

### 4. Create CategoryScreen
- New screen component
- List questionnaires
- Navigation to questionnaire

### 5. Update Navigation
- Add CategoryScreen to navigator
- Update route params
- Add breadcrumbs

### 6. Update HomeScreen
- Show categories instead of topics
- Card-based layout
- Category icons

### 7. Update State Management
- Add category context
- Update journey store
- Track selected category

## API Changes

### QuestionnaireService

```typescript
// Old
getTopics(): Topic[]
getKnowledgeBlock(id: string): KnowledgeBlock

// New
getCategories(): Category[]
getQuestionnaires(categoryId: string): Questionnaire[]
getQuestionnaire(categoryId: string, questionnaireId: string): Questionnaire
```

### Data Fetching

```typescript
// Fetch categories
const categories = await fetch('/assets/contexts/categories.json');

// Fetch questionnaires for category
const questionnaires = await fetch(`/assets/contexts/categories/${categoryPath}/`);
```

## Migration Checklist

- [ ] Create this documentation
- [ ] Copy content from sdsa.team
- [ ] Update TypeScript types
- [ ] Create CategoryScreen
- [ ] Update HomeScreen
- [ ] Update QuestionnaireService
- [ ] Update navigation
- [ ] Test category loading
- [ ] Test questionnaire fetching
- [ ] Update chat context
- [ ] Remove old code

## Breaking Changes

1. **Removed**: Knowledge blocks, decision trees, YAML parsing
2. **Changed**: Navigation flow now includes categories
3. **New**: Category-based organization, JSON questionnaires

## Benefits

1. **Simpler Structure**: Flat questionnaires instead of nested trees
2. **Better Organization**: Categories group related content
3. **Easier Contribution**: JSON format is more accessible
4. **Consistent with sdsa.team**: Same structure as content repository

## Testing

### Test Cases
1. Category loading from assets
2. Questionnaire listing by category
3. Question rendering (all types)
4. Custom text input handling
5. Chat context with category info
6. Offline caching
7. Error handling

### Sample Data
Two categories with one questionnaire each:
- CI/CD & DevOps → CI/CD Pipeline Setup
- Testing & Quality → E2E Testing Setup

## Rollback Plan

If issues arise:
1. Keep old code in separate branch
2. Feature flag for new UI
3. Gradual migration per category
4. Maintain backward compatibility temporarily

## Timeline

- **Phase 1** (Now): Documentation and planning
- **Phase 2** (Next): Copy content and update types
- **Phase 3**: Create new screens and services
- **Phase 4**: Update existing screens
- **Phase 5**: Testing and polish
- **Phase 6**: Remove old code

## Notes

- Maintain app functionality during migration
- Test on all platforms (web, iOS, Android)
- Update documentation and README
- Consider user feedback on new flow