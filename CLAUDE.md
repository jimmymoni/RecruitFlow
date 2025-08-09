# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## RecruitFlow - Recruitment Management System

A modern, lightweight recruitment management web application designed specifically for small-scale recruitment agencies. Built to be affordable, easy to use, and feature-rich without the complexity of enterprise solutions.

### Design Philosophy
- **Refreshing & Energetic**: Clean, modern UI with blue/teal primary colors and orange accents
- **Welcoming Interface**: Friendly greetings, progress celebrations, and intuitive navigation
- **Mobile-First**: Responsive design for recruiters working on-the-go
- **Budget-Friendly**: Target pricing 60-70% less than competitors like Recruit CRM

## Common Commands

```bash
# Project setup
npm install

# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Linting
npm run lint
```

## Architecture Overview

### Technology Stack
- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom brand colors
- **Icons**: Lucide React for consistent iconography
- **State Management**: React hooks (useState, useEffect)
- **Backend**: To be implemented (Node.js/Express planned)

### Project Structure
```
├── src/
│   ├── App.tsx          # Main dashboard component
│   ├── main.tsx         # React app entry point
│   └── index.css        # Global styles with Tailwind imports
├── index.html           # HTML template
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies and scripts
```

### Current Features (MVP Dashboard)
- **Welcome Dashboard**: Personalized greeting and daily overview
- **Key Metrics**: Active candidates, open jobs, monthly placements, revenue
- **Quick Actions**: Fast access to common tasks (add candidate, post job, etc.)
- **Pipeline Overview**: Job status tracking with visual badges
- **Today's Schedule**: Calendar integration preview
- **Activity Feed**: Real-time updates and notifications
- **Responsive Design**: Works on desktop, tablet, and mobile

### Brand Colors
- **Primary**: Blue-teal gradient (#0ea5e9 to #0284c7)
- **Accent**: Orange (#f97316, #ea580c)
- **Success**: Green (#10b981)
- **Neutral**: Gray scales for backgrounds and text

## Development Standards & Best Practices

### Code Quality Guidelines
- **TypeScript First**: All components use strict TypeScript with proper interfaces
- **Component Architecture**: Single-responsibility components with clear prop interfaces
- **Error Handling**: Graceful error states and user feedback
- **Performance**: Lazy loading and efficient re-renders
- **Accessibility**: ARIA labels and keyboard navigation support

### Premium UI Standards
- **Dark Theme**: Consistent dark-900 to dark-100 color scale
- **Glassmorphism**: `bg-gradient-to-br from-dark-800 to-dark-700` backgrounds
- **Premium Effects**: `shadow-premium`, `shadow-glow`, `backdrop-blur-sm`
- **Smooth Animations**: Framer Motion with consistent hover/tap effects
- **Responsive Design**: Mobile-first with `sm:`, `md:`, `lg:` breakpoints

### Animation Patterns
```tsx
// Standard hover/tap animations
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}

// Container animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

// Item animations  
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
}
```

### File Structure Conventions
```
src/
├── components/           # Reusable UI components
├── types/               # TypeScript interfaces
├── data/                # Mock data and constants
├── utils/               # Helper functions
├── hooks/               # Custom React hooks
└── assets/              # Images, icons, etc.
```

### Data Structure Patterns
- **Interfaces**: Comprehensive TypeScript interfaces for all data
- **Mock Data**: Realistic test data that matches production scenarios
- **State Management**: React hooks with proper type safety
- **API Ready**: Structure designed for easy backend integration

### Current System Features
- **Candidate Management**: Complete CRUD with bulk operations and communication tracking
- **Communication System**: Timeline view with filtering, add forms, and interaction history
- **Premium UI**: Dark theme with neon accents and smooth animations
- **Responsive Design**: Mobile-optimized layouts and touch interactions

### Development Workflow
1. **Planning**: Use `/feature-plan` command before starting new features
2. **Implementation**: Follow established patterns and component structure
3. **Testing**: Use `/test-feature` to verify functionality
4. **Review**: Use `/ui-review` to ensure design consistency
5. **Commit**: Use `/commit-check` before committing changes

### Custom Commands Available
- `/feature-plan` - Strategic feature planning and architecture
- `/ui-review` - Design system consistency check
- `/test-feature` - Comprehensive feature testing
- `/commit-check` - Pre-commit code quality review

### Strategic Context
- **Competitive Analysis**: See `COMPETITIVE_ANALYSIS.md` for detailed market research and positioning strategy
- **Document Management**: Critical differentiator - 55% of HR leaders overwhelmed by current solutions
- **Pricing Strategy**: 70% cost advantage over competitors like RecruitCRM ($35 vs $95/month)
- **Target Market**: Small agencies underserved by expensive enterprise solutions

### Next Priority Features
1. **Document Management**: Resume uploads, file attachments, document viewer (COMPETITIVE ADVANTAGE)
2. **Job Management**: Job posting creation, candidate matching, pipeline tracking
3. **Client Portal**: Company profiles, job requirements, communication history
4. **Analytics Dashboard**: Placement metrics, revenue tracking, performance insights
5. **Automation Tools**: Email templates, workflow automation, notification system

### Target Market
- Small recruitment agencies (1-10 employees)
- Solo recruiters and boutique firms
- Agencies looking for affordable CRM alternatives
- Price-conscious market segment underserved by enterprise solutions