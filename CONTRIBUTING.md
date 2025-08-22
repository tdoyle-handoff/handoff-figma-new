# Contributing to Handoff

Thank you for your interest in contributing to Handoff! This document provides guidelines and information for contributors.

## 🎯 How to Contribute

### Reporting Issues
1. **Search existing issues** first to avoid duplicates
2. **Use issue templates** when creating new issues
3. **Provide detailed information** including steps to reproduce
4. **Include screenshots** for UI-related issues

### Suggesting Features
1. **Check the roadmap** to see if it's already planned
2. **Create a feature request** with detailed use case
3. **Explain the business value** and user benefit
4. **Consider implementation complexity**

### Code Contributions
1. **Fork the repository** and create a feature branch
2. **Follow the coding standards** outlined below
3. **Write tests** for new functionality
4. **Update documentation** as needed
5. **Submit a pull request** with clear description

## 🏗️ Development Setup

### Prerequisites
- Node.js 18+ and npm
- Supabase CLI
- Git

### Local Development
```bash
# Clone your fork
git clone https://github.com/yourusername/handoff.git
cd handoff

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Fill in your API keys and configuration

# Start development server
npm run dev
```

### Testing Your Changes
```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Test Supabase functions
./verify-setup.sh

# Test API integrations
# Visit /?api-key-manager=true
```

## 📝 Coding Standards

### TypeScript Guidelines
- **Use strict TypeScript** - Enable all strict flags
- **Define interfaces** for all data structures
- **Use proper typing** - Avoid `any`, prefer specific types
- **Export types** from centralized type files

### React Guidelines  
- **Functional components** with hooks preferred
- **Custom hooks** for complex logic
- **Context sparingly** - Only for truly global state
- **Error boundaries** for robust error handling

### Code Style
```typescript
// ✅ Good - Clear, typed, documented
interface PropertyData {
  id: string;
  address: string;
  price: number;
}

export const PropertyCard: React.FC<{ property: PropertyData }> = ({ 
  property 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Component logic here
  
  return (
    <Card className="property-card">
      {/* JSX here */}
    </Card>
  );
};

// ❌ Avoid - Unclear, untyped, undocumented  
export const Card = (props: any) => {
  return <div>{props.children}</div>;
};
```

### File Organization
```
components/
├── ui/              # shadcn/ui components (don't modify)
├── forms/           # Form components
├── layout/          # Layout components  
├── property/        # Property-specific components
└── [Feature]/       # Feature-specific components

hooks/
├── use[Feature].ts  # Feature-specific hooks
└── use[Generic].ts  # Generic utility hooks

utils/
├── api.ts          # API utilities
├── constants.ts    # Application constants
└── helpers.ts      # Generic helpers
```

### Styling Guidelines
- **Use Tailwind classes** for styling
- **Follow the design system** defined in globals.css
- **Mobile-first approach** - Design for mobile, enhance for desktop
- **Consistent spacing** - Use design system variables

```tsx
// ✅ Good - Uses design system, mobile-first
<div className="modern-card mobile-spacing md:desktop-spacing">
  <h2 className="text-lg font-medium mb-4">Property Details</h2>
  {/* Content */}
</div>

// ❌ Avoid - Arbitrary values, inconsistent spacing
<div className="bg-white p-3 rounded-lg shadow-md">
  <h2 className="text-xl font-bold mb-2">Property Details</h2>
  {/* Content */}
</div>
```

## 🧪 Testing

### Component Testing
- **Test user interactions** not implementation details
- **Mock external dependencies** (APIs, Supabase)
- **Test error states** and edge cases
- **Ensure accessibility** in tests

### Integration Testing
- **Test API endpoints** with real data
- **Test authentication flows** 
- **Test mobile responsiveness**
- **Test cross-browser compatibility**

## 📖 Documentation

### Code Documentation
```typescript
/**
 * Fetches comprehensive property data from ATTOM API
 * @param address - Full property address
 * @param options - Additional query options
 * @returns Property data with valuations and characteristics
 * @throws {Error} When API key is invalid or address not found
 */
export async function fetchPropertyData(
  address: string, 
  options?: AttomQueryOptions
): Promise<AttomPropertyResponse> {
  // Implementation
}
```

### Component Documentation
- **PropTypes/Interfaces** for all props
- **Usage examples** in comments
- **Accessibility notes** when relevant
- **Performance considerations** for complex components

## 🚀 Deployment

### Pull Request Process
1. **Create feature branch** from `main`
2. **Make your changes** following guidelines above
3. **Test thoroughly** on multiple devices/browsers
4. **Update documentation** if needed
5. **Submit PR** with detailed description

### PR Description Template
```markdown
## Changes Made
- Brief list of changes

## Testing Performed  
- [ ] Desktop testing (Chrome, Firefox, Safari)
- [ ] Mobile testing (iOS Safari, Android Chrome)
- [ ] API integration testing
- [ ] Accessibility testing

## Screenshots
[Include before/after screenshots for UI changes]

## Breaking Changes
[List any breaking changes and migration steps]
```

### Review Process
- **Code review** by maintainers
- **Testing verification** on review environment  
- **Documentation review** for completeness
- **Performance review** for optimization opportunities

## 🐛 Bug Fixes

### Bug Report Requirements
- **Clear reproduction steps** 
- **Expected vs actual behavior**
- **Environment information** (browser, device, etc.)
- **Screenshots or videos** when helpful
- **Console errors** if applicable

### Bug Fix Process
1. **Reproduce the bug** locally
2. **Identify root cause** with debugging
3. **Write test case** to prevent regression
4. **Implement minimal fix** 
5. **Verify fix** across different scenarios

## 🔒 Security

### Security Guidelines
- **Never commit API keys** or secrets
- **Use environment variables** for configuration
- **Validate all inputs** on client and server
- **Follow OWASP guidelines** for web security

### Reporting Security Issues
- **Email directly** to maintainers (don't use public issues)
- **Provide detailed information** about the vulnerability
- **Wait for response** before public disclosure

## 📞 Getting Help

### Community Support
- **GitHub Discussions** - Ask questions and share ideas
- **GitHub Issues** - Report bugs and request features
- **Documentation** - Check the `/docs` folder first

### Maintainer Contact
- Create an issue for general questions
- Email for security concerns
- Tag maintainers in PRs for reviews

## 🏆 Recognition

Contributors will be recognized in:
- **Contributors section** of README
- **Release notes** for significant contributions  
- **Documentation** for major feature additions

Thank you for helping make Handoff better for everyone! 🎉