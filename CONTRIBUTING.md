# Contributing to TruthTok 🌟

Thank you for your interest in contributing to TruthTok! We're excited to have you join our mission to bring truth back to news through verified video content.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)
- [Style Guidelines](#style-guidelines)
- [Community](#community)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 🚀 Getting Started

1. **Fork the Repository**
   ```bash
   # Clone your fork
   git clone https://github.com/your-username/truth-tok.git
   cd truth-tok
   
   # Add upstream remote
   git remote add upstream https://github.com/original/truth-tok.git
   ```

2. **Set Up Development Environment**
   ```bash
   # Frontend setup
   cd frontend
   npm install
   
   # Backend setup
   cd ../backend
   python -m venv venv
   source venv/bin/activate  # or `venv\Scripts\activate` on Windows
   pip install -r requirements.txt
   ```

3. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🔄 Development Process

1. **Keep Your Fork Updated**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run Tests**
   ```bash
   # Frontend tests
   cd frontend
   npm run test
   
   # Backend tests
   cd backend
   pytest
   ```

3. **Check Code Style**
   ```bash
   # Frontend
   npm run lint
   
   # Backend
   flake8
   black .
   ```

## 📝 Pull Request Process

1. **Before Submitting**
   - Update documentation for any new features
   - Add or update tests as needed
   - Run the full test suite
   - Update the CHANGELOG.md if applicable

2. **PR Guidelines**
   - Use a clear, descriptive title
   - Reference any related issues
   - Include screenshots for UI changes
   - Update README.md if needed

3. **PR Template**
   ```markdown
   ## Description
   [Describe your changes]

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   [Describe testing steps]

   ## Screenshots
   [If applicable]
   ```

## 🏗️ Project Structure

```
truth-tok/
├── frontend/          # Next.js frontend application
│   ├── src/          # Source code
│   └── public/       # Static assets
├── backend/          # Python backend service
│   ├── api/         # API endpoints
│   └── services/    # Business logic
└── docs/            # Documentation
```

## 📐 Style Guidelines

### Frontend
- Use TypeScript for all new code
- Follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use functional components and hooks
- Implement responsive design
- Write meaningful component and function names

### Backend
- Follow [PEP 8](https://www.python.org/dev/peps/pep-0008/)
- Use type hints
- Write docstrings for functions and classes
- Keep functions focused and small
- Use meaningful variable names

## 👥 Community

- Join our [Telegram group](https://t.me/truthtok_chat)
- Follow us on [Twitter](https://twitter.com/truthtok)
- Read our [blog](https://blog.truthtok.com)

## 🎯 Good First Issues

Look for issues labeled with `good-first-issue` to get started. These are carefully selected for new contributors.

## 🔍 Code Review Process

1. All code changes require review
2. Reviewers will look for:
   - Functionality
   - Code style
   - Test coverage
   - Documentation
   - Performance implications

## 📈 Release Process

1. Version numbers follow [SemVer](http://semver.org/)
2. Changes are documented in CHANGELOG.md
3. Releases are tagged in Git
4. Release notes are posted on GitHub

## ❓ Questions?

- Check our [FAQ](docs/FAQ.md)
- Ask in our Telegram group
- Open a [Discussion](https://github.com/your-username/truth-tok/discussions)

Thank you for contributing to TruthTok! 🙏
