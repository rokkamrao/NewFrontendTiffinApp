# Tiffin Admin Dashboard - Figma Design Specifications

## Design System Overview

### Brand Colors
```css
/* Primary Colors */
--primary-blue: #0d6efd;
--primary-dark: #0b5ed7;
--primary-light: #e7f1ff;

/* Secondary Colors */
--secondary-gray: #6c757d;
--light-gray: #f8f9fa;
--border-gray: #e9ecef;

/* Status Colors */
--success-green: #198754;
--warning-orange: #fd7e14;
--danger-red: #dc3545;
--info-cyan: #0dcaf0;

/* Background Colors */
--bg-primary: #ffffff;
--bg-secondary: #f8f9fa;
--bg-accent: #e7f1ff;
```

### Typography Scale
```css
/* Font Family */
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing System
```css
--space-1: 0.25rem;      /* 4px */
--space-2: 0.5rem;       /* 8px */
--space-3: 0.75rem;      /* 12px */
--space-4: 1rem;         /* 16px */
--space-5: 1.25rem;      /* 20px */
--space-6: 1.5rem;       /* 24px */
--space-8: 2rem;         /* 32px */
--space-10: 2.5rem;      /* 40px */
--space-12: 3rem;        /* 48px */
```

### Border Radius
```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-2xl: 20px;
--radius-full: 50%;
```

## Component Specifications

### 1. Layout Components

#### Sidebar Navigation
```figma-specs
Width: 280px (expanded) / 70px (collapsed)
Height: 100vh
Background: #ffffff
Border: 1px solid #e9ecef (right)

Header Section:
- Height: 64px
- Padding: 16px
- Brand logo + text
- Collapse toggle button (right aligned)

Navigation Section:
- Padding: 16px 0
- Max height with scroll
- Nav items: 48px height, 12px margin horizontal
- Active state: #e7f1ff background, #0d6efd text
- Hover state: #f8f9fa background

Footer Section:
- Height: 80px
- Padding: 16px
- User avatar + info (when expanded)
```

#### Top Header
```figma-specs
Height: 64px
Background: #ffffff
Border: 1px solid #e9ecef (bottom)
Padding: 12px 24px
Z-index: 100 (sticky)

Left Section:
- Breadcrumb navigation
- Mobile menu toggle (hidden on desktop)

Right Section:
- Search box: 300px width, 20px radius
- Notification bell with badge
- Quick actions dropdown
- User profile dropdown
```

### 2. Dashboard Components

#### Metric Cards
```figma-specs
Card Dimensions: Responsive grid (4 columns desktop, 2 mobile)
Height: 120px
Background: #ffffff
Border: 1px solid #e9ecef
Border radius: 12px
Padding: 24px
Box shadow: 0 2px 4px rgba(0,0,0,0.05)

Icon Section:
- Size: 48x48px
- Background: Color with 10% opacity
- Border radius: 12px
- Icon: 24px, colored

Content Section:
- Title: 36px, font-weight 700
- Subtitle: 16px, color #6c757d
- Trend: 14px, colored based on positive/negative
```

#### Chart Container
```figma-specs
Background: #ffffff
Border: 1px solid #e9ecef
Border radius: 12px
Padding: 24px

Header:
- Height: 40px
- Title: 20px font-weight 600
- Controls: Right aligned (time range selector)

Chart Area:
- Height: 300px
- Responsive width
- Grid lines: #f8f9fa
- Data visualization: Primary colors
```

#### Performance Metrics
```figma-specs
Progress Bars:
- Height: 6px
- Background: rgba(0,0,0,0.1)
- Border radius: 3px
- Animated fill with colored background

Labels:
- Top: metric name (14px)
- Right: percentage value (14px, font-weight 600)
- Spacing: 16px between metrics
```

### 3. Data Table Components

#### Order List Table
```figma-specs
Table Container:
- Background: #ffffff
- Border: 1px solid #e9ecef
- Border radius: 12px

Header:
- Height: 56px
- Background: #f8f9fa
- Font weight: 600
- Border bottom: 1px solid #e9ecef

Rows:
- Height: 64px
- Padding: 16px
- Border bottom: 1px solid #f8f9fa
- Hover: #f8f9fa background

Status Badges:
- Height: 24px
- Padding: 4px 8px
- Border radius: 12px
- Font size: 12px
- Font weight: 500

Action Buttons:
- Size: 32x32px
- Border radius: 6px
- Icon only for compact view
```

### 4. Form Components

#### Input Fields
```figma-specs
Height: 40px
Padding: 8px 12px
Border: 1px solid #dee2e6
Border radius: 8px
Font size: 14px

Focus State:
- Border: 2px solid #0d6efd
- Box shadow: 0 0 0 3px rgba(13,110,253,0.1)

Error State:
- Border: 1px solid #dc3545
- Text color: #dc3545
```

#### Buttons
```figma-specs
Primary Button:
- Height: 40px
- Padding: 8px 16px
- Background: #0d6efd
- Color: #ffffff
- Border radius: 8px
- Font weight: 500

Secondary Button:
- Background: transparent
- Border: 1px solid #0d6efd
- Color: #0d6efd

Small Button:
- Height: 32px
- Padding: 6px 12px
- Font size: 14px
```

#### Dropdown Menus
```figma-specs
Container:
- Min width: 200px
- Background: #ffffff
- Border: 1px solid #e9ecef
- Border radius: 8px
- Box shadow: 0 4px 12px rgba(0,0,0,0.15)

Items:
- Height: 40px
- Padding: 8px 16px
- Hover: #f8f9fa background
- Active: #e7f1ff background
```

### 5. Modal and Dialog Components

#### Modal Container
```figma-specs
Overlay:
- Background: rgba(0,0,0,0.5)
- Z-index: 1050

Modal:
- Max width: 600px
- Background: #ffffff
- Border radius: 16px
- Box shadow: 0 20px 25px rgba(0,0,0,0.15)

Header:
- Height: 64px
- Padding: 16px 24px
- Border bottom: 1px solid #e9ecef

Body:
- Padding: 24px
- Max height: 70vh (scrollable)

Footer:
- Padding: 16px 24px
- Border top: 1px solid #e9ecef
- Button alignment: right
```

### 6. Alert and Notification Components

#### Alert Cards
```figma-specs
Height: Auto (min 60px)
Padding: 16px
Border radius: 8px
Border left: 4px solid (status color)

Info Alert:
- Background: #e7f6ff
- Border: #0dcaf0
- Text: #055160

Warning Alert:
- Background: #fff3cd
- Border: #fd7e14
- Text: #664d03

Error Alert:
- Background: #f8d7da
- Border: #dc3545
- Text: #721c24

Success Alert:
- Background: #d1edff
- Border: #198754
- Text: #0f5132
```

#### Toast Notifications
```figma-specs
Width: 350px
Height: Auto
Background: #ffffff
Border: 1px solid #e9ecef
Border radius: 8px
Box shadow: 0 8px 16px rgba(0,0,0,0.1)
Position: Fixed top-right
Animation: Slide in from right
```

## Responsive Breakpoints

### Desktop (1200px+)
- Sidebar: 280px width
- Main content: Full layout
- Grid: 4 columns for metrics
- Tables: Full feature set

### Tablet (768px - 1199px)
- Sidebar: Collapsible overlay
- Grid: 2 columns for metrics
- Tables: Horizontal scroll
- Reduced padding

### Mobile (< 768px)
- Sidebar: Hidden by default, full overlay when open
- Grid: 1 column for metrics
- Tables: Card layout instead of table
- Touch-optimized buttons (44px min)
- Reduced font sizes

## Animation Guidelines

### Transitions
```css
/* Standard easing */
transition: all 0.2s ease;

/* Smooth transforms */
transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

/* Opacity changes */
transition: opacity 0.15s linear;
```

### Hover Effects
```css
/* Card elevation */
transform: translateY(-2px);
box-shadow: 0 4px 12px rgba(0,0,0,0.1);

/* Button interactions */
transform: scale(0.98); /* on active */
```

### Loading States
```css
/* Skeleton loading */
background: linear-gradient(90deg, #f8f9fa 25%, #e9ecef 50%, #f8f9fa 75%);
animation: skeleton-loading 1.5s infinite ease-in-out;

/* Spinner */
border: 2px solid #f8f9fa;
border-top: 2px solid #0d6efd;
animation: spin 1s linear infinite;
```

## Icon Library (Bootstrap Icons)

### Navigation Icons
- Dashboard: `bi-speedometer2`
- Orders: `bi-box-seam`
- Users: `bi-people`
- Analytics: `bi-graph-up`
- Settings: `bi-gear`

### Action Icons
- Add: `bi-plus-lg`
- Edit: `bi-pencil`
- Delete: `bi-trash`
- View: `bi-eye`
- Download: `bi-download`

### Status Icons
- Success: `bi-check-circle`
- Warning: `bi-exclamation-triangle`
- Error: `bi-x-circle`
- Info: `bi-info-circle`

## Implementation Notes for Developers

### CSS Variables Usage
```css
:root {
  /* Use design tokens */
  --primary: #0d6efd;
  --secondary: #6c757d;
  /* Implement in component styles */
}

.btn-primary {
  background-color: var(--primary);
  border-color: var(--primary);
}
```

### Component Structure
```typescript
// Follow this pattern for all components
export interface ComponentProps {
  // Type all props
}

@Component({
  selector: 'app-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Use semantic HTML -->
    <!-- Apply design system classes -->
  `,
  styles: [`
    /* Component-specific styles */
    /* Use CSS custom properties */
  `]
})
```

### Accessibility Requirements
- ARIA labels for all interactive elements
- Keyboard navigation support
- Focus indicators with 3px outline
- Color contrast ratio minimum 4.5:1
- Screen reader friendly text
- Semantic HTML structure

## Figma Export Guide

### Assets to Export
1. **Component Library**: All button states, form elements, cards
2. **Icons**: SVG format, 24px grid
3. **Color Palette**: Hex values and usage guide
4. **Typography**: Font specifications and hierarchy
5. **Layout Grids**: 12-column grid system
6. **Spacing Guide**: Padding and margin specifications

### File Organization
```
📁 Tiffin Admin Design System
  📁 01 - Foundations
    📄 Colors
    📄 Typography
    📄 Spacing
    📄 Icons
  📁 02 - Components
    📄 Buttons
    📄 Forms
    📄 Cards
    📄 Tables
    📄 Navigation
  📁 03 - Layouts
    📄 Dashboard
    📄 Detail Pages
    📄 Modals
  📁 04 - Examples
    📄 Order Management
    📄 Analytics Dashboard
    📄 User Profile
```

This comprehensive design specification provides all the visual and interactive details needed for both designers working in Figma and developers implementing the admin dashboard.