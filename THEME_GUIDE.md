# PhoneHub Design System & Theme Guide

## 🎨 Font Choice: Inter

**Inter** is our primary font family, chosen for its:
- **Modern & Clean**: Perfect for tech/repair businesses
- **Highly Readable**: Excellent for both UI and content
- **Professional**: Trusted by major tech companies (GitHub, Figma, etc.)
- **Screen Optimized**: Designed specifically for digital interfaces
- **Variable Font**: Supports multiple weights (300-900)

### Font Weights Available
- `font-light` (300)
- `font-normal` (400)
- `font-medium` (500)
- `font-semibold` (600)
- `font-bold` (700)
- `font-extrabold` (800)
- `font-black` (900)

## 🎯 Color Palette

### Primary Colors
- **Primary**: `hsl(221.2 83.2% 53.3%)` - Modern blue
- **Primary Glow**: `hsl(221.2 83.2% 63.3%)` - Lighter blue for effects
- **Success**: `hsl(142.1 76.2% 36.3%)` - Green for positive actions
- **Warning**: `hsl(38 92% 50%)` - Orange for warnings
- **Info**: `hsl(221.2 83.2% 53.3%)` - Blue for information

### Neutral Colors
- **Background**: `hsl(0 0% 100%)` - Pure white
- **Foreground**: `hsl(222.2 84% 4.9%)` - Dark text
- **Muted**: `hsl(210 40% 96%)` - Light gray backgrounds
- **Border**: `hsl(214.3 31.8% 91.4%)` - Subtle borders

## 🎪 Typography Classes

### Display Text
```css
.text-display
/* Large headings: 4xl-6xl, font-black, tight tracking */
```

### Headings
```css
.text-heading
/* Main headings: 3xl-4xl, font-bold, tight tracking */
```

### Subheadings
```css
.text-subheading
/* Section headings: xl-2xl, font-semibold, tight tracking */
```

### Body Text
```css
.text-body
/* Regular content: base, font-normal, relaxed leading */
```

### Captions
```css
.text-caption
/* Small text: sm, font-medium */
```

## 🌈 Gradient System

### Primary Gradients
- `bg-gradient-primary` - Main brand gradient
- `bg-gradient-hero` - Hero section gradient
- `bg-gradient-card` - Card background gradient
- `bg-gradient-success` - Success state gradient
- `bg-gradient-warning` - Warning state gradient

### Text Gradients
- `text-gradient-primary` - Primary text gradient
- `text-gradient-success` - Success text gradient
- `text-gradient-warning` - Warning text gradient

## 🎭 Component Classes

### Buttons
```css
.btn-primary    /* Primary action button with glow effect */
.btn-secondary  /* Secondary action button */
.btn-ghost      /* Ghost button for subtle actions */
```

### Cards
```css
.card-elegant  /* Standard card with hover effects */
.card-glow     /* Glowing card for special content */
```

### Badges
```css
.badge-success  /* Success state badge */
.badge-warning  /* Warning state badge */
.badge-info     /* Information badge */
```

## ✨ Animation System

### Transition Classes
```css
.transition-smooth  /* Standard transitions */
.transition-spring  /* Bouncy spring animations */
.transition-bounce  /* Bounce effect transitions */
```

### Animation Classes
```css
.animate-fade-in    /* Fade in animation */
.animate-slide-up   /* Slide up from bottom */
.animate-bounce-in  /* Bounce in effect */
```

## 🎨 Glass Morphism

### Glass Effects
```css
.glass      /* Light glass effect */
.glass-dark /* Dark glass effect */
```

## 📱 Responsive Design

### Breakpoints
- `sm`: 640px and up
- `md`: 768px and up
- `lg`: 1024px and up
- `xl`: 1280px and up
- `2xl`: 1536px and up

### Container
- Centered with responsive padding
- Max width: 1400px at 2xl breakpoint

## 🌙 Dark Mode Support

All colors and components automatically adapt to dark mode with:
- Inverted color schemes
- Adjusted gradients
- Modified shadows
- Preserved contrast ratios

## 🎯 Usage Examples

### Hero Section
```jsx
<h1 className="text-display text-white">
  Expert Phone
  <span className="text-gradient-primary"> Repair</span>
  <br />
  Services
</h1>
```

### Feature Cards
```jsx
<Card className="card-elegant animate-fade-in">
  <CardContent className="p-8">
    <h3 className="text-subheading text-foreground">
      Feature Title
    </h3>
  </CardContent>
</Card>
```

### Action Buttons
```jsx
<Button className="btn-primary">
  Get Started
</Button>
```

### Status Badges
```jsx
<span className="badge-success">Completed</span>
<span className="badge-warning">Pending</span>
<span className="badge-info">In Progress</span>
```

## 🚀 Best Practices

1. **Typography Hierarchy**: Use the predefined typography classes for consistency
2. **Color Usage**: Stick to the defined color palette for brand consistency
3. **Animations**: Use animations sparingly to enhance UX, not distract
4. **Responsive**: Always test across different screen sizes
5. **Accessibility**: Ensure sufficient contrast ratios and readable font sizes
6. **Performance**: Use CSS custom properties for efficient theming

## 🎨 Customization

To customize the theme:
1. Modify CSS custom properties in `src/index.css`
2. Update Tailwind config in `tailwind.config.ts`
3. Add new component classes in the `@layer components` section
4. Test changes across light and dark modes

This design system provides a modern, professional foundation for your phone repair business while maintaining excellent usability and accessibility.
