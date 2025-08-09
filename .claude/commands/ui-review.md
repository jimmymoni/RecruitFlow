# UI Consistency Review Command

Review the current implementation against RecruitFlow's premium design system.

## Design System Standards:
- **Colors**: 
  - Primary: Blue-teal gradient (#0ea5e9 to #0284c7)
  - Accent: Orange (#f97316, #ea580c) 
  - Success: Green (#10b981)
  - Dark theme: dark-900 to dark-100 scale
  - Neon accents: neon-blue, neon-green, neon-purple

- **Components**:
  - Glassmorphism backgrounds: `bg-gradient-to-br from-dark-800 to-dark-700`
  - Premium shadows: `shadow-premium`
  - Glow effects: `shadow-glow`
  - Rounded corners: `rounded-xl`
  - Border: `border border-dark-600`

- **Typography**:
  - Headers: `text-white font-bold`
  - Body: `text-dark-200`
  - Accents: `text-neon-blue`

- **Animations**:
  - Hover: `whileHover={{ scale: 1.05 }}`
  - Tap: `whileTap={{ scale: 0.95 }}`
  - Smooth transitions: `transition-all duration-300`

## Review Checklist:
1. Color consistency with design system
2. Proper dark theme implementation  
3. Animation smoothness and consistency
4. Responsive design patterns
5. Component reusability
6. TypeScript type safety
7. Accessibility considerations

Analyze the current files and identify any inconsistencies with these standards.