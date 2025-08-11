# RecruitFlow Design System

## 🎨 Visual Identity & Brand Guidelines

### Brand Colors
```css
/* Primary Colors */
--primary-blue: #0ea5e9      /* Primary brand blue */
--primary-teal: #0284c7      /* Primary brand teal */
--accent-orange: #f97316     /* Accent orange */
--accent-orange-dark: #ea580c /* Darker orange variant */

/* Success & Status */
--success-green: #10b981     /* Success actions */
--neon-green: #10b981        /* Bright highlights */
--neon-blue: #0ea5e9         /* Interactive elements */
--neon-purple: #8b5cf6       /* Premium features */

/* Dark Theme Palette */
--dark-900: #111827          /* Darkest backgrounds */
--dark-800: #1f2937          /* Card backgrounds */
--dark-700: #374151          /* Elevated surfaces */
--dark-600: #4b5563          /* Borders & dividers */
--dark-500: #6b7280          /* Disabled states */
--dark-400: #9ca3af          /* Muted text */
--dark-300: #d1d5db          /* Secondary text */
--dark-200: #e5e7eb          /* Primary text on dark */
--dark-100: #f3f4f6          /* Highest contrast text */
```

## 📝 Typography System

### Font Families
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```

### Font Sizes & Weights
```css
/* Headers */
.text-3xl { font-size: 1.875rem; font-weight: 700; } /* Main titles */
.text-2xl { font-size: 1.5rem; font-weight: 600; }   /* Section headers */
.text-xl { font-size: 1.25rem; font-weight: 600; }   /* Card titles */
.text-lg { font-size: 1.125rem; font-weight: 500; }  /* Subtitles */

/* Body Text */
.text-base { font-size: 1rem; font-weight: 400; }    /* Normal text */
.text-sm { font-size: 0.875rem; font-weight: 400; }  /* Small text */
.text-xs { font-size: 0.75rem; font-weight: 400; }   /* Fine print */

/* Interactive Elements */
.font-medium { font-weight: 500; }  /* Buttons, links */
.font-semibold { font-weight: 600; } /* Important labels */
.font-bold { font-weight: 700; }     /* Headlines */
```

### Text Colors
```css
/* Dark Theme Text Hierarchy */
.text-white      /* Highest priority text */
.text-dark-100   /* Primary text */
.text-dark-200   /* Secondary text */
.text-dark-300   /* Tertiary text */
.text-dark-400   /* Muted text */

/* Status Colors */
.text-neon-blue   /* Links & interactive */
.text-neon-green  /* Success states */
.text-accent-500  /* Orange highlights */
.text-red-400     /* Error states */
```

## 🎭 Component Patterns

### Modal/Dialog Standards
```tsx
/* Standard Modal Container */
const modalOverlay = {
  position: 'fixed' as const,
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.85)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}

/* Standard Modal Card */
const modalCard = {
  backgroundColor: 'rgba(0, 0, 0, 0.95)',  /* Faded black */
  padding: '32px',
  borderRadius: '16px',
  width: '420px',
  maxWidth: '90vw',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
}
```

### Form Element Standards
```tsx
/* Standard Input Field */
const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  backgroundColor: '#374151',  /* dark-700 */
  border: '1px solid #4b5563', /* dark-600 */
  borderRadius: '8px',
  color: '#f3f4f6',           /* dark-100 */
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color 0.2s'
}

/* Focus State */
inputStyle[':focus'] = {
  borderColor: '#0ea5e9'  /* neon-blue */
}

/* Standard Button */
const buttonPrimary = {
  width: '100%',
  padding: '12px 24px',
  background: 'linear-gradient(to right, #3b82f6, #06b6d4)',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontWeight: '500',
  fontSize: '14px',
  cursor: 'pointer',
  transition: 'transform 0.1s'
}
```

### Interactive States
```css
/* Hover Effects */
.hover-scale { transform: scale(1.02); }
.hover-glow { box-shadow: 0 0 20px rgba(14, 165, 233, 0.4); }

/* Button States */
.btn-primary:hover { 
  background: linear-gradient(to right, #2563eb, #0891b2);
  transform: translateY(-1px);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Loading States */
.loading { opacity: 0.6; cursor: not-allowed; }
```

## 📦 Spacing System

### Padding & Margin Scale
```css
/* Standard Spacing Units */
.p-2  { padding: 8px; }     /* Tight */
.p-3  { padding: 12px; }    /* Small */
.p-4  { padding: 16px; }    /* Medium */
.p-6  { padding: 24px; }    /* Large */
.p-8  { padding: 32px; }    /* XL */

.m-2  { margin: 8px; }      /* Tight */
.m-4  { margin: 16px; }     /* Medium */
.m-6  { margin: 24px; }     /* Large */

/* Component-Specific */
.modal-padding { padding: 32px; }        /* Modal content */
.form-spacing { margin-bottom: 20px; }   /* Form fields */
.button-spacing { margin-top: 24px; }    /* Action buttons */
```

### Layout Patterns
```tsx
/* Standard Form Layout */
const formContainer = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '20px'
}

/* Standard Header Layout */
const headerLayout = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '32px'
}
```

## 🎯 Animation Standards

### Transition Timings
```css
/* Standard Durations */
--transition-fast: 150ms;     /* Micro-interactions */
--transition-medium: 200ms;   /* Standard hover/focus */
--transition-slow: 300ms;     /* Modal open/close */
--transition-page: 500ms;     /* Page transitions */

/* Easing Functions */
--ease-out: cubic-bezier(0.25, 0.46, 0.45, 0.94);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Standard Animations
```tsx
/* Modal Animations */
const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { duration: 0.2, ease: 'easeOut' }
  }
}

/* Button Hover */
const buttonHover = {
  scale: 1.02,
  y: -1,
  transition: { duration: 0.15 }
}
```

## 🔧 Component Library Usage

### When Creating New Components:
1. **Use these exact color values** - no custom colors
2. **Follow spacing patterns** - consistent padding/margins
3. **Match typography hierarchy** - appropriate font sizes/weights
4. **Include hover/focus states** - interactive feedback
5. **Add loading states** - for async operations
6. **Maintain accessibility** - proper contrast ratios

### Component Checklist:
- [ ] Uses design system colors
- [ ] Follows spacing patterns  
- [ ] Matches typography hierarchy
- [ ] Includes interactive states
- [ ] Has proper accessibility
- [ ] Responsive design
- [ ] Consistent with existing components

## 🎨 Visual Effects

### Glassmorphism Effects
```css
.glass-card {
  background: rgba(31, 41, 55, 0.8);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.glass-header {
  background: rgba(17, 24, 39, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
```

### Shadow System
```css
.shadow-sm    { box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); }
.shadow-md    { box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
.shadow-lg    { box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1); }
.shadow-xl    { box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1); }
.shadow-glow  { box-shadow: 0 0 20px rgba(14, 165, 233, 0.4); }
.shadow-premium { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
```

---

*This design system ensures consistency across all RecruitFlow components and interfaces.*