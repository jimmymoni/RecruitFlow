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

## Development Notes

### Component Structure
- Single-file components with TypeScript
- Tailwind classes for styling
- Lucide React icons throughout
- Mock data integration for development

### Planned Features
1. **Candidate Management**: Profile creation, resume parsing, notes
2. **Job Pipeline**: Kanban-style workflow management
3. **Client Management**: Company profiles and relationship tracking
4. **Analytics Dashboard**: Advanced reporting and insights
5. **Communication Tools**: Automated emails and notifications
6. **Mobile App**: Native mobile experience

### Target Market
- Small recruitment agencies (1-10 employees)
- Solo recruiters and boutique firms
- Agencies looking for affordable CRM alternatives
- Price-conscious market segment underserved by enterprise solutions