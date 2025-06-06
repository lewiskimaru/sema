# Sema AI - Experience AI in Your Native Language

Sema AI is an intelligent translation and chat interface meticulously designed to break down language barriers. It offers a seamless, intuitive experience for translating text and documents, or engaging in multilingual conversations with an AI assistant, all within a clean, minimalist, and accessible environment.

## ✨ Key Features

*   **Dual Mode Interface:** Instantly switch between:
    *   **Translate Mode:** Translate text or entire documents between a vast array of languages.
    *   **Chat Mode:** Converse naturally with an AI assistant, with support for multilingual interactions.
*   **Intuitive & Powerful Language Selection:**
    *   Dedicated parameters icon to access clear "Input Language" and "Target Language" selectors in Translate Mode.
    *   Google Translate-style wide panel for comprehensive language selection, supporting hundreds of languages with an integrated search function.
    *   Quick Target Language Selection: Use `@language_name` (e.g., `@Spanish`) directly in the input field when in Translate Mode.
*   **Document Handling:** Upload documents (e.g., `.txt`, `.pdf`, `.docx`) for translation or to discuss their content with the AI.
*   **Highly Interactive & User-Focused Experience:**
    *   Real-time translation and chat responses with a subtle, animated three-dot "typing" indicator.
    *   One-click copy for user and AI messages, with "Copied!" visual feedback.
    *   Edit your previous queries for re-submission.
    *   Provide feedback (thumbs up/down) on AI responses.
    *   Regenerate AI responses.
*   **User-Centric Design & Interface:**
    *   Strict monochromatic (black, white, gray) light theme for a sharp, modern, and focused experience.
    *   Sleek, collapsible sidebar for navigation and core functions, with distinct states for logged-in and logged-out users.
    *   Contextual input area: centered on initial view, docked at the bottom during active sessions.
    *   Specific icon-driven input area for `[+] Document Upload`, `[☰ sliders] Parameters`, `[Chat Mode]`, `[Translate Mode]`, and `[●↑] Send`.
*   **Personalization & Session Management:**
    *   User accounts for history and preferences.
    *   Chat/session naming, renaming, and deletion capabilities.
    *   Access to chat history (for logged-in users).
*   **Engaging Elements:**
    *   Animated "Experience AI in your native language" welcome message (cycles through languages).
    *   "Learn" section in the sidebar for language resources and blog content.
*   **Performance & Accessibility:**
    *   Skeleton loading screens for improved perceived performance.
    *   Designed with accessibility best practices (keyboard navigation, ARIA, contrast).

## 🚀 Getting Started

(This section will detail setup, build, and run instructions once development commences.)

```bash
# Example (will be updated)
git clone https://github.com/lewiskimaru/sema-ai.git
cd sema-ai
npm install # or yarn install
npm start   # or yarn start
```
## Design & Frontend Philosophy

Sema AI prioritizes a highly refined, minimalist, and intuitive user experience. The design is strictly monochromatic, emphasizing clarity and focus.

For detailed overall design principles, color palette, typography, and iconography, please refer to the [DESIGN.md](DESIGN.md) document.

For specific UI component breakdowns, states, interactions, and layout structures, please refer to the [FRONTEND.md](FRONTEND.md) document.

## 🛠️ Tech Stack (Tentative)

- **Frontend**: 
  - React.js (with TypeScript)
  
- **Styling**: 
  - Tailwind CSS / CSS Modules / Styled Components
  
- **Backend**: 
  - Fastapi
  
- **AI/Translation APIs**: 
  - OpenAI API, Google Translate API, etc.
  
- **Database**: 
  - PostgreSQL / MongoDB (for user accounts, chat history, settings)
