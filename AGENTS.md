# Agent Guidelines for VerbyBack

## Project Overview

VerbyBack is a French Conjugation & Search API built with Express.js. It scrapes conjugations from leconjugueur.lefigaro.fr and exposes them via a REST API.

## Commands

```bash
# Install dependencies
npm install

# Run the server (development)
node index.js

# Run tests
npm test
```

- Server runs on port 3000 by default (configurable via PORT env variable)
- Test UI available at http://localhost:3000/test

## Code Style

### General
- Use **CommonJS** (`require`/`module.exports`) - project uses `"type": "commonjs"`
- No trailing commas
- 4-space indentation
- No semicolons (consistent with project style)

### File Structure
- Main entry: `index.js`
- Static files served from `test/` directory
- No subdirectories for source code - keep it simple

### Naming Conventions
- Functions: `camelCase` (e.g., `getConjugations`, `searchVerbs`, `slugify`)
- Variables: `camelCase` or `SCREAMING_SNAKE_CASE` for constants
- URL params: `snake_case` (e.g., `:verb`, `:mode`, `:tense`)
- Helper functions should be defined before routes

### Comments
- Use JSDoc for functions that perform complex operations
- No inline comments unless explaining non-obvious logic
- Example:
  ```javascript
  /**
   * Normalizes strings for URL matching.
   */
  const slugify = (str) => { ... };
  ```

### Async/Await
- Always use `async`/`await` for HTTP requests and file operations
- Always wrap in try/catch for route handlers
- Return structured error responses with appropriate HTTP status codes:
  - `404` for not found
  - `500` for server errors
  - `400` for bad requests

### Express Routes
- Define helper functions before route handlers
- Group related routes together
- Use consistent error response format:
  ```javascript
  res.status(404).json({ error: "Verb not found" });
  ```

### API Response Format
- Always return JSON
- Conjugation endpoints return structured data with verb name, mode, tense, and forms
- Search endpoint returns array of verb strings

### Dependencies
- Express.js for the server
- axios for HTTP requests
- cheerio for HTML parsing
- cors for cross-origin support

### Error Handling
- Scraping errors: return 404 with descriptive message
- Network errors: return 500 with error details
- Validation errors: return 400 with validation message
- Never expose internal error details in production

### Git Workflow
- Commit messages should be concise and descriptive
- Group related changes in single commits
- Test changes before committing

## Code Review Checklist

- [ ] All async functions have try/catch
- [ ] Error responses have appropriate HTTP status codes
- [ ] No hardcoded values that should be environment variables
- [ ] No sensitive data logged or exposed
- [ ] New endpoints documented in README.md
- [ ] Test UI updated if adding new endpoints
