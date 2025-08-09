# Pre-Commit Review Command

Review all changes before committing to ensure code quality and consistency.

## Review Process:
1. **Run git status and git diff** to see all changes
2. **Code Quality Check**: Review for best practices and patterns
3. **RecruitFlow Standards**: Ensure consistency with our established patterns
4. **Testing**: Verify no breaking changes
5. **Commit Message**: Suggest clear, descriptive commit message

## Code Quality Checklist:
- [ ] No commented-out code or debugging statements
- [ ] Consistent TypeScript interfaces and types
- [ ] Proper error handling
- [ ] No hardcoded values (use constants/config)
- [ ] Component reusability maintained
- [ ] Premium UI standards followed
- [ ] Responsive design patterns used

## RecruitFlow Patterns:
- TypeScript interfaces in separate type files
- Framer Motion for animations
- Tailwind classes following our design system
- Mock data patterns for development
- Component-based architecture

## Commit Message Format:
```
<type>: <description>

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

Types: feat, fix, style, refactor, perf, test, docs

Review all staged changes and suggest improvements before committing.