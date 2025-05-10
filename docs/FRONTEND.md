# Sema Translator - Frontend Design & Development Guide

**Technology Stack:** React (with Vite)
**Target Backend API:** `https://sematranslate-translator.hf.space`

## 1. Design Philosophy & Aesthetics

*   **Modern, Clean, Sleek:** The UI should feel contemporary, uncluttered, and professional.
*   **Minimalist Color Palette:** Primarily black and white, leveraging the black logo.
    *   **Primary:** Black (`#000000` or a very dark gray like `#121212` for main backgrounds if pure black is too stark) and White (`#FFFFFF` for text, elements on dark backgrounds).
    *   **Accent Color (Suggestion):** A vibrant, yet not overwhelming, accent color for calls to action (buttons), active states, progress indicators, and subtle highlights.
        *   **Option 1 (Tech Blue):** A bright, modern blue (e.g., `#007AFF` - Apple's blue, or a similar vibrant electric blue `#3B82F6` - Tailwind's blue-500). This contrasts well with black and white and often signifies technology and trust.
        *   **Option 2 (Energetic Teal/Cyan):** A color like `#14B8A6` (Tailwind's teal-500) or `#06B6D4` (cyan-500). This can feel fresh and innovative.
        *   **Option 3 (Warm Gold/Orange - Use Sparingly):** A sophisticated gold like `#F59E0B` (amber-500) could be used very sparingly for premium features or specific highlights, but might be harder to balance with a black/white theme.
    *   **Grays:** Utilize various shades of gray for secondary text, borders, disabled states, and subtle depth.
*   **Typography:**
    *   Choose a clean, readable sans-serif font family (e.g., Inter, Roboto, Open Sans, Montserrat).
    *   Ensure good contrast ratios for accessibility.
*   **Iconography:** Use a consistent set of modern, minimalist icons (e.g., from Feather Icons, Heroicons, or Material Symbols).
*   **Spacing & Layout:** Generous use of whitespace to avoid clutter. Consistent margins and padding. A responsive grid system (e.g., CSS Grid, Flexbox).

## 2. Core User Flows & Page Structure

### 2.1 Landing Page / Home (`/`)

*   **Hero Section (Above the Fold):**
    *   **Dominant Element: Instant Translation Panel.**
        *   **Input Area:** Large textarea for source text.
        *   **Language Selection:**
            *   Source Language: Dropdown with "Auto-detect" as default. Can select manually.
            *   Target Language: Dropdown to select target language.
            *   "Swap Languages" button.
        *   **Translate Button:** Prominent, using the accent color.
        *   **Output Area:** Large textarea for translated text (read-only or with copy functionality).
        *   **Progress Indication:** When "Translate" is clicked:
            *   The button could show a subtle loading spinner.
            *   A minimalist progress bar or animated dots could appear below the input/above the output area.
            *   Text like "Translating..."
    *   **Clever Tabs/Navigation for Feature Discovery:**
        *   Subtly integrated above or beside the translation panel, or as secondary navigation items in the main header.
        *   Tabs: "Translate" (active by default), "Chat", "Languages", "API" (if applicable for public info).
        *   These tabs might not navigate away immediately but could change the content *within* the hero section or just below it, or scroll to relevant sections.

*   **Below the Fold (Landing Page Content):**
    1.  **Language Map Section:**
        *   Visually engaging, interactive world map (e.g., using a library like `react-simple-maps` or a custom SVG).
        *   Clickable regions/countries.
        *   Clicking a region/country:
            *   Could subtly highlight the region.
            *   **Action:** Navigates the user to the translation panel (or a dedicated translation page `/translate`) with the language selection pre-filtered or pre-set to languages commonly spoken in that region. (e.g., clicking France pre-selects French as target).
    2.  **Features Overview:** Briefly highlight key features (Multilingual Chat, Accurate Translations, API Access).
    3.  **Call to Action (CTA):** "Sign Up for More Features" or "Explore Our API".

### 2.2 Header Navigation (Persistent)

*   **Left:** Sema Translator Logo (black, links to Home).
*   **Center/Right (Unauthenticated):**
    *   Translate (links to Home/Translation Panel).
    *   Chat (links to `/chat`, prompts login if accessed).
    *   Languages (links to language discovery/map section or a dedicated page).
    *   API (links to commercial API info page).
    *   Login Button.
    *   Sign Up Button (accent color).
*   **Center/Right (Authenticated):**
    *   Translate.
    *   Chat (links to `/chat`).
    *   History (dropdown: Translation History, Chat History).
    *   API Keys (if user has API access).
    *   User Profile Dropdown (shows display name/avatar):
        *   Profile Settings.
        *   Logout.

### 2.3 Footer (Persistent)

*   **Columns/Sections:**
    *   **Sema Mission:** A brief statement about the mission/vision.
    *   **Product:** Links to Translate, Chat, API.
    *   **Resources:** API Documentation, Help/FAQ.
    *   **Company:** About Us, Contact.
    *   **Legal:** Terms of Service, Privacy Policy.
    *   Social media icons (optional).
    *   Copyright notice: `© [Year] Sema Translator. All rights reserved.`

### 2.4 Translation Page (`/translate` or integrated into Home)

*   Essentially the hero section's translation panel, possibly with more space if on a dedicated page.
*   **If Authenticated:** A "Save to History" toggle/button might appear, or translations are auto-saved.

### 2.5 Chat Page (`/chat`) - Requires Authentication

*   **Layout:**
    *   **Left Sidebar (optional):** List of past chat sessions. Ability to start a new chat.
    *   **Main Chat Area:**
        *   **Message Display:** Standard chat interface (user messages aligned right, bot messages left).
            *   Timestamps for messages.
            *   For bot "thinking": Display animated three dots (`...`) or a subtle "Sema is typing..." indicator.
        *   **Input Area:** Text input field, send button.
*   **Multilingual Handling (UX):**
    *   The system handles translations transparently. The user types in their language, receives responses in their language.
    *   (Optional, for advanced users or debugging): A small indicator showing the original language of a message if it was translated.

### 2.6 Translation History Page (`/history/translations`) - Requires Authentication

*   **Layout:** Table or list view of past translations.
*   **Information per entry:**
    *   Original Text (snippet).
    *   Translated Text (snippet).
    *   Source Language.
    *   Target Language.
    *   Date/Time.
    *   Actions: View full, Re-translate, Delete.
*   **Filtering/Sorting:** By date, language.
*   **Pagination.**

### 2.7 Chat History Page (`/history/chats`) - Requires Authentication

*   **Layout:** List of past chat sessions.
*   **Information per session:**
    *   Session Start Date/Time (or last active).
    *   A snippet of the first/last message or an AI-generated title/summary.
*   **Action:** Click to open and view the full chat session (navigates to a view similar to the active chat page but read-only for that session).

### 2.8 User Profile Page (`/profile` or `/account/settings`) - Requires Authentication

*   Update display name.
*   Change preferred language.
*   Change password (if local auth).
*   Manage email preferences.

### 2.9 API Key Management Page (`/account/api-keys`) - Requires Authentication & relevant subscription

*   List existing API keys (name, prefix, creation date, status).
*   Generate new API key (show full key once).
*   Revoke API keys.
*   (Optional) Edit key name/scopes.
*   View API usage statistics linked to their keys.

## 3. Authentication & Session Management

*   **HTTP Cookies (Recommended for Web App):**
    *   Use `HttpOnly`, `Secure` (in production), and `SameSite=Lax` or `SameSite=Strict` cookies to store JWT tokens or session IDs. This is generally more secure against XSS than `localStorage`.
    *   The backend will issue the JWT upon login, and the frontend will send it automatically with subsequent requests to protected backend endpoints.
*   **Persistent Login:**
    *   **Long-lived JWTs with Refresh Tokens:**
        *   Issue a short-lived access token (e.g., 15-60 minutes).
        *   Issue a long-lived refresh token (e.g., 7-30 days) stored securely in an `HttpOnly` cookie.
        *   When the access token expires, the frontend (or a global request interceptor like in Axios) attempts to use the refresh token to get a new access token from a dedicated backend endpoint (`/auth/refresh-token`).
        *   If the refresh token is also expired or invalid, the user is logged out and must re-authenticate.
    *   This approach avoids users having to log in frequently while maintaining good security.
*   **State Management:** Use a state management library (Context API, Zustand, Redux, Jotai) to manage user authentication state globally in the React app.

## 4. Key Components & Interactions

*   **`TranslationPanel` Component:** Reusable for home page and dedicated translation page. Handles input, output, language selection, and API calls to `/translate/text`. Shows progress.
*   **`ChatInterface` Component:** Manages displaying messages, sending user input, and handling streamed responses from `/chat/stream`. Shows "typing" indicator.
*   **`LanguageMap` Component:** Interactive map for language discovery.
*   **`HistoryTable` Component:** Reusable for displaying translation or chat history.
*   **`AuthGuard` / `ProtectedRoute` HOC or Hook:** Protects routes that require authentication. Redirects to login if not authenticated.
*   **API Service Module:** A dedicated module/functions for making API calls to the backend (`https://sematranslate-translator.hf.space`), handling request/response formatting, error handling, and attaching auth tokens. (e.g., using Axios or `fetch`).

## 5. Responsiveness

*   All pages and components must be fully responsive, adapting to various screen sizes (desktop, tablet, mobile).
*   Use responsive design techniques (CSS Grid, Flexbox, media queries).

## 6. Accessibility (a11y)

*   Ensure semantic HTML.
*   Provide `alt` text for images and icons where necessary.
*   Ensure sufficient color contrast.
*   Keyboard navigability for all interactive elements.
*   ARIA attributes where appropriate.

## 7. Performance Considerations

*   **Vite Build Optimizations:** Leverage Vite's fast HMR and optimized production builds.
*   **Code Splitting:** Route-based code splitting to load only necessary JavaScript for each page.
*   **Lazy Loading:** Lazy load images and components that are not immediately visible.
*   **Memoization:** Use `React.memo`, `useMemo`, `useCallback` where appropriate to prevent unnecessary re-renders.
*   **Efficient State Management:** Avoid excessive global state updates.
*   **Minimize API Calls:** Debounce input for features like auto-suggest if implemented; fetch data efficiently.
