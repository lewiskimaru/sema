
---

## `DESIGN.MD`

```markdown
# Sema AI - Design Philosophy & Visual Guidelines

This document outlines the core design philosophy, visual identity, and overarching aesthetic principles for the Sema AI application. The aim is a sophisticated, minimalist, and highly usable interface.

## 1. Core Design Principles

*   **Monochromatic Minimalism:** The design exclusively uses black, white, and shades of gray. This creates a sharp, focused, and modern aesthetic, eliminating distractions and emphasizing content and functionality.
*   **Clarity & Purpose:** Every UI element and interaction must have a clear, unambiguous purpose. Simplicity and intuitive understanding are paramount.
*   **User Focus:** The design prioritizes the user's tasks (translation and chat), ensuring an efficient and frictionless experience.
*   **Consistency:** UI elements, interactions, and visual language must be consistent throughout the application to build user trust and reduce cognitive load.
*   **Accessibility as Standard:** Design choices must inherently support accessibility, ensuring the application is usable by the widest possible audience.

## 2. Color Palette (Strict Monochromatic Light Theme)

The entire UI will adhere to this palette. No other colors should be introduced for interactive elements or accents unless specifically for standard, universally understood status indicators (which are generally avoided in this strict theme).

*   **Page Background:** `#FFFFFF` (White) or `#F9F9F9` (Very Light Off-White, for subtle depth if pure white is too stark).
*   **Element Backgrounds (e.g., Sidebar, Input Bar, Modals):** `#F0F0F0` (Light Gray) or `#EAEAEA` (Slightly Darker Light Gray). Message bubbles will use contrasting shades from this range (e.g., one white, one light gray).
*   **Primary Text:** `#000000` (Black).
*   **Secondary Text (Placeholders, Labels, Less Emphasized Info):** `#555555` (Dark Gray) or `#777777` (Medium Gray).
*   **Icons (Default State):** `#333333` (Very Dark Gray) or `#000000` (Black).
*   **Icons (Hover/Active State):** `#000000` (Black), or a subtle change in background for the icon's clickable area.
*   **Borders & Dividers:** `#DCDCDC` (Gray) or `#CCCCCC` (Lighter Gray).
*   **Focus Indicators:** A distinct black or dark gray outline (e.g., 2px solid) or a subtle background shift that provides sufficient contrast.
*   **Disabled Elements:** Text/icons use `#AAAAAA` (Light Gray); backgrounds might be slightly more transparent or lighter.

## 3. Typography

*   **Font Family:** A clean, highly legible sans-serif font family is recommended. Examples: Inter, Roboto, Open Sans, Lato. Choose one and use it consistently.
*   **Hierarchy:**
    *   **Headings (e.g., Modal Titles, Section Titles):** Larger font size, black, potentially a slightly heavier weight.
    *   **Body Text (Chat Messages, Main Content):** Standard size, black.
    *   **Secondary Text (Tooltips, Placeholders, Sidebar Labels):** Slightly smaller size, dark gray.
*   **Readability:** Ensure ample line height and letter spacing for comfortable reading.

## 4. Iconography

*   **Style:** Exclusively line icons or minimally styled solid icons (e.g., for the `[+]` button background if the icon itself is reversed out). **No emojis or illustrative icons.**
*   **Consistency:** Use a single, high-quality icon set (e.g., Feather Icons, Heroicons - Outline, Material Symbols - Outline variant, or a custom-designed SVG set adhering to the style).
*   **Color:** Adhere to the icon color specifications in the Color Palette section.
*   **Clarity:** Icons must be instantly recognizable and clearly represent their function. Tooltips are mandatory for icon-only buttons.
*   **Size:** Maintain consistent sizing for icons within similar contexts (e.g., all sidebar icons, all input area icons).

## 5. Layout Philosophy

*   **Contextual Views:**
    *   **Before First Query:** The input area is centered to draw immediate focus and invite interaction. The welcome message is prominent.
    *   **After First Query:** The input area docks to the bottom, making way for the conversation view, a standard for chat interfaces.
*   **Sidebar Functionality:** The sidebar serves as the primary navigation and control hub for session management, history, learning resources, and user settings. Its collapsible nature optimizes screen real estate.
*   **Visual Hierarchy:** Use spacing, borders, and subtle background variations (within the monochromatic scheme) to create a clear visual hierarchy and delineate different sections of the UI.

## 6. Accessibility (General Guidelines)

*   **WCAG Adherence:** Strive to meet WCAG 2.1 AA guidelines.
*   **Keyboard Navigation:** All interactive elements must be fully operable via keyboard in a logical order.
*   **Focus Management:** Clear, visible focus indicators for all focusable elements.
*   **ARIA Attributes:** Use appropriate ARIA roles, states, and properties for dynamic content, custom controls, and to enhance screen reader compatibility.
*   **Semantic HTML:** Use HTML elements according to their semantic meaning.
*   **Color Contrast:** While monochromatic, ensure sufficient contrast between text/icons and their backgrounds, especially for grays. Test all combinations.
*   **Text Resizing:** The UI should remain usable when text size is increased by the user.

## 7. Animation & Motion

*   **Subtlety:** Animations should be subtle, purposeful, and brief, enhancing the user experience without being distracting.
*   **Purpose:** Use for transitions (sidebar expand/collapse, modal open/close), feedback (button press, loading indicators), and drawing attention to important changes.
*   **Performance:** Ensure animations are performant and do not degrade the user experience on less powerful devices.
*   **Examples:**
    *   Smooth slide for sidebar.
    *   Gentle fade/scale for modals.
    *   Subtle dot animation for the AI typing indicator.