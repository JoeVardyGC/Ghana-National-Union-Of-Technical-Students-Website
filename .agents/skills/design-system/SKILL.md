---
name: design-system
description: Restricts UI component creation to modern primitives, Tailwind CSS v4, Lucide Icons, WCAG AA accessibility, and mobile-first responsive design system standards.
---

# GNUTS Modern UI/UX Design System & Component Guidelines

This skill enforces high-end, production-ready frontend standards for the Ghana National Union of Technical Students (GNUTS) web platform.

## 1. Core Technology Stack
- **Styling & Tokens**: Tailwind CSS v4 (`@tailwindcss/postcss`) with custom color tokens (`#014900` GNUTS Forest Green, `#D9A000` Metallic Gold).
- **Component Primitives**: Standardize on reusable React primitives with accessible semantic HTML tags (`<section>`, `<article>`, `<header>`, `<footer>`, `<button>`, `aria-label`).
- **Typography**: Next.js Google Fonts (`next/font/google`) featuring Montserrat & Inter variable fonts.
- **Iconography**: `lucide-react` icons exclusively (`Building2`, `User`, `Zap`, `ThumbsUp`, `Calendar`, `Clock`, `ArrowRight`, `Share2`, `Search`, etc.).
- **Data & State**: Next.js 16 App Router Server Components & Server Actions for optimistic UI states.

## 2. UI/UX Rules & Pitfall Prevention
- ❌ **No Generic Purple/Blue Gradients**: Stick strictly to GNUTS Forest Green (`#014900`) and Gold (`#D9A000`).
- ❌ **No Oversized Rounded Corners**: Use clean, sharp corner architecture (`rounded-none` or `rounded-sm`).
- ❌ **No Raw Unstyled Elements**: All interactive controls must feature clean hover transitions (`transition-all duration-300`).
- ❌ **No Italicized Headings**: Section titles and project headers must use non-italicized bold uppercase typography (`uppercase font-extrabold`).

## 3. Responsive & Accessibility (a11y)
- **Mobile-First Breakpoints**: Explicitly design layout grids starting from mobile (`grid-cols-1`) up to desktop (`md:grid-cols-2 lg:grid-cols-3`).
- **WCAG AA Compliance**: Ensure high text-to-background contrast ratios (white text on `#014900` green background, dark text on `#f8f9fa` background).
- **Semantic ARIA Roles**: Include explicit `aria-label`, `title`, and keyboard-navigable focus rings on all interactive buttons.
