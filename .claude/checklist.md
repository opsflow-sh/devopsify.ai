# Pre-Commit Quality Checklist

**Use this checklist before every commit to ensure code quality.**

## Code Quality ✅

- [ ] No `any` types in function signatures
- [ ] All functions have explicit return types
- [ ] No console.log() in production code (use proper logging)
- [ ] No commented-out code blocks
- [ ] No debugging statements (debugger, alert, etc)
- [ ] Import statements are organized (types first, then packages, then local)
- [ ] No unused imports
- [ ] No unused variables

## Type Safety ✅

- [ ] All form inputs validated with Zod
- [ ] All API responses are typed
- [ ] All database queries are typed
- [ ] No type assertions without comments
- [ ] No `any` or `unknown` without good reason
- [ ] Nullable values handled explicitly

## Security ✅

- [ ] All SQL queries parameterized ($1, $2, etc)
- [ ] No string concatenation in SQL
- [ ] All user inputs validated
- [ ] Auth middleware applied to protected routes
- [ ] Authorization checks verify user ownership
- [ ] No credentials in code
- [ ] No secrets in console/logs
- [ ] Stripe webhooks verify signature
- [ ] Session tokens are random 40+ char
- [ ] Password hashed with bcrypt

## Error Handling ✅

- [ ] All async functions wrapped in try/catch
- [ ] Database errors don't expose schema
- [ ] User-facing errors are helpful, not revealing
- [ ] No unhandled promise rejections
- [ ] All error paths have tests
- [ ] Errors logged with context
- [ ] Error responses use consistent format

## Database ✅

- [ ] All queries parameterized
- [ ] Foreign key columns indexed
- [ ] No N+1 query patterns
- [ ] Large result sets paginated
- [ ] Multi-step operations use transactions
- [ ] Connection pooling configured
- [ ] Nullable fields explicit in schema

## Frontend Components ✅

- [ ] All components have typed props
- [ ] Component files <= 150 lines (split if larger)
- [ ] Forms use react-hook-form
- [ ] Data fetching uses react-query
- [ ] UI components from ShadcN used
- [ ] Tailwind classes for styling
- [ ] Error states handled and shown
- [ ] Loading states shown to user
- [ ] Buttons have clear labels
- [ ] Form inputs have labels
- [ ] No inline styles (use Tailwind)

## User-Facing Copy ✅

- [ ] No DevOps jargon in user-facing text
- [ ] Check against forbidden words list
- [ ] Error messages are plain English
- [ ] Copy is specific, not generic
- [ ] Copy is calm, not alarmist
- [ ] All risk explanations in plain English
- [ ] Platform recommendations are Replit-neutral

## Testing ✅

- [ ] Happy path tested (normal case works)
- [ ] Edge cases tested (empty, null, extremes)
- [ ] Error paths tested
- [ ] Invalid input rejected
- [ ] Validation works correctly
- [ ] Algorithm is deterministic (for judgment engine)

## Styling & Responsiveness ✅

- [ ] Works on mobile (test with DevTools)
- [ ] Works on desktop
- [ ] Colors use Tailwind theme
- [ ] No hardcoded colors
- [ ] Images have alt text
- [ ] Links have appropriate styling
- [ ] Focus states visible (accessibility)

## Documentation ✅

- [ ] Function comments explain purpose (if not obvious)
- [ ] Complex algorithms documented
- [ ] Error scenarios documented
- [ ] No implementation details in user-facing text

## Performance ✅

- [ ] Database queries are efficient
- [ ] No N+1 queries
- [ ] Large result sets paginated
- [ ] No memory leaks in React components
- [ ] No infinite loops
- [ ] Async operations have timeouts

## File Organization ✅

- [ ] Files in correct directory
- [ ] File names are descriptive
- [ ] No files > 300 lines
- [ ] Related code grouped logically
- [ ] Imports use path aliases (@/, @shared/)

## Git Commit ✅

- [ ] Commit message is descriptive
- [ ] Commit includes one logical feature
- [ ] No unrelated changes in commit
- [ ] No debug code in commit
- [ ] All tests passing
- [ ] `npm run typecheck` passes

## Running Tests

```bash
# Run all tests
npm test

# Run specific test
npm test -- auth.spec.ts

# Check types
npm run typecheck

# Format code
npm run format.fix
```

## Quick Checklist Template

Copy this for each commit:

```
## Pre-Commit Checklist

**File:** _______________
**Feature:** _______________

- [ ] Code quality (no any, no logs)
- [ ] Types all explicit
- [ ] Security (parameterized SQL, validated input)
- [ ] Error handling (try/catch, helpful errors)
- [ ] Database (indexed, no N+1)
- [ ] Frontend (props typed, ShadcN UI)
- [ ] Copy (plain English, no jargon)
- [ ] Tests (happy path + edge cases)
- [ ] Git commit message clear
- [ ] Tests passing
- [ ] TypeScript check passing
```
