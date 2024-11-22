# Expectations for Commits

Maintaining a clear and consistent commit history is crucial for collaboration and project maintenance. Please adhere to the following expectations when making commits.

## Commit Message Format

```
[Type]: Short description (max 72 characters)

Optional extended description explaining **what** and **why**.
```

- Start the short description with a capital letter
- Do not end the short description with a period
- Use the imperative mood ("Add feature" not "Added feature")
- Wrap the body at 72 characters
- Use the body to explain what and why vs. how

## Commit Types

- **feat**: A new feature or enhancement
  - Example: `feat: add user authentication system`
  - Example: `feat: implement video upload progress bar`

- **fix**: A bug fix
  - Example: `fix: resolve memory leak in video processing`
  - Example: `fix: correct GPS coordinates parsing`

- **docs**: Documentation changes
  - Example: `docs: update API documentation`
  - Example: `docs: add deployment guide`

- **style**: Changes that do not affect code functionality
  - Example: `style: format code according to style guide`
  - Example: `style: remove trailing whitespace`

- **refactor**: Code changes that neither fix a bug nor add a feature
  - Example: `refactor: restructure video processing pipeline`
  - Example: `refactor: optimize database queries`

- **perf**: Performance improvements
  - Example: `perf: improve video compression algorithm`
  - Example: `perf: optimize geospatial queries`

- **test**: Adding or modifying tests
  - Example: `test: add unit tests for auth module`
  - Example: `test: update integration tests`

- **chore**: Changes to build process or auxiliary tools
  - Example: `chore: update dependencies`
  - Example: `chore: configure CI pipeline`

## Best Practices

### 1. Make Atomic Commits

- Each commit should represent a single logical change
- If you find yourself using "and" in your commit message, you should probably split it into multiple commits
- This makes it easier to:
  - Review changes
  - Find bugs (through bisection)
  - Revert changes if necessary

### 2. Commit Early and Often

- Make small commits as you work
- This helps:
  - Track your progress
  - Provide better context for changes
  - Make code reviews easier

### 3. Never Commit

- Temporary files
- IDE configuration files
- Build artifacts
- Dependencies (use package managers instead)
- Sensitive information (API keys, passwords, etc.)

### 4. Write Good Commit Messages

#### The Seven Rules of a Great Commit Message

1. Separate subject from body with a blank line
2. Limit the subject line to 50 characters
3. Capitalize the subject line
4. Do not end the subject line with a period
5. Use the imperative mood in the subject line
6. Wrap the body at 72 characters
7. Use the body to explain what and why vs. how

#### Example of a Good Commit Message

```
feat: Implement automatic video metadata extraction

- Add GPS coordinate extraction from video metadata
- Implement timestamp validation
- Add device information parsing

This feature enables automatic verification of video authenticity by
extracting and validating metadata from uploaded videos. It helps prevent
fake content by ensuring videos are captured in real-time with valid
device information.

Resolves: #123
```

### 5. Branch Management

- Create feature branches from `develop`
- Use the following naming convention:
  - `feature/description-of-feature`
  - `bugfix/description-of-bug`
  - `hotfix/description-of-hotfix`
  - `release/version-number`

### 6. Before Committing

- Run all tests
- Ensure code follows project style guidelines
- Review your changes
- Update documentation if necessary
- Remove debug statements and commented-out code

### 7. Commit Signing

- Configure GPG key signing for your commits
- This verifies the authenticity of your commits
- Use `git commit -S` to sign commits

## Git Workflow

1. Update your local repository
   ```bash
   git fetch origin
   git pull origin develop
   ```

2. Create a feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. Make changes and commit
   ```bash
   git add <files>
   git commit -S
   ```

4. Push changes
   ```bash
   git push origin feature/your-feature-name
   ```

5. Create a pull request
   - Ensure CI passes
   - Request review from team members
   - Address review comments

## Common Issues and Solutions

### Fixing a Bad Commit Message

If you haven't pushed your changes:
```bash
git commit --amend
```

### Squashing Multiple Commits

```bash
git rebase -i HEAD~n  # where n is the number of commits to squash
```

### Adding Forgotten Changes to Last Commit

```bash
git add <forgotten-files>
git commit --amend --no-edit
```

Remember: Never amend commits that have been pushed to shared branches unless absolutely necessary and coordinated with the team. 