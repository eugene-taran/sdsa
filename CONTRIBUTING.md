# Contributing to SDSA

Thank you for your interest in contributing to SDSA! We welcome contributions from the community to help improve the app and expand our questionnaire library.

## How to Contribute

### 🐛 Reporting Bugs

If you find a bug, please open an issue with:
- A clear title and description
- Steps to reproduce the issue
- Expected vs actual behavior
- Screenshots if applicable
- Your environment (OS, device, app version)

### 💡 Suggesting Features

We love feature suggestions! Please open an issue with:
- Clear description of the feature
- Use cases and benefits
- Any implementation ideas

### 📝 Contributing Questionnaires

Questionnaires are the heart of SDSA. To add a new questionnaire:

1. **Choose a category** or propose a new one
2. **Create your questionnaire** in `contexts/categories/[category]/`
3. **Follow the format**:

```json
{
  "id": "your-questionnaire-id",
  "title": "Clear Title",
  "description": "What this helps with",
  "questions": [
    {
      "type": "radio|checkbox|text|textarea",
      "label": "Your question?",
      "options": [...] // For radio/checkbox
    }
  ],
  "llmConfig": {
    "systemPrompt": "You are an expert in...",
    "temperature": 0.7,
    "maxTokens": 1500
  },
  "metadata": {
    "author": "your-github-username"
  }
}
```

#### Question Types
- **text**: Single-line input
- **textarea**: Multi-line input
- **radio**: Single choice
- **checkbox**: Multiple choice

### 🛠 Code Contributions

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature`
3. **Make your changes**
4. **Test thoroughly**: Run `yarn test` and `yarn lint`
5. **Commit with clear messages**
6. **Push and create a Pull Request**

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/sdsa.git
cd sdsa

# Install dependencies
yarn install

# Start development
yarn start

# Run tests
yarn test

# Check linting
yarn lint

# Build for production
yarn build
```

## Code Style

- We use TypeScript for type safety
- ESLint for code quality
- Prettier for formatting (optional but recommended)
- Write tests for new features
- Keep components small and focused
- Use meaningful variable names

## Pull Request Guidelines

- **One feature per PR** - Keep PRs focused
- **Update tests** - Add/update tests as needed
- **Update docs** - If you change functionality
- **Clean commits** - Squash if needed
- **Description** - Clearly explain what and why

### PR Checklist

- [ ] Tests pass (`yarn test`)
- [ ] Linting passes (`yarn lint`)
- [ ] Build succeeds (`yarn build`)
- [ ] Documentation updated if needed
- [ ] Questionnaires validated (if applicable)

## Questionnaire Best Practices

1. **Focus on context gathering** - Ask questions that help understand the user's specific situation
2. **Be comprehensive** - Cover common scenarios and edge cases
3. **Clear language** - Questions should be easy to understand
4. **Good prompts** - Help the LLM provide valuable responses
5. **Test your questionnaire** - Ensure it generates helpful recommendations

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to open an issue or start a discussion
---
