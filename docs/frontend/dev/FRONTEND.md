# Sema AI - Frontend UI/UX Specifications

This document details the specific UI components, layout structures, states, and interactions for the Sema AI application frontend. It serves as a guide for development, ensuring adherence to the established design principles.

## 1. Overall Layout Structure

The application interface is primarily composed of a Top Bar, a Left Sidebar, a Main Content Area, and an Input Area.

### 1.1. Top Bar (Header)

*   **Logged-Out Users:**
    *   **Left:** (Optional) Sema AI Logo/Name.
    *   **Right:** `[About Sema AI]` link/button, `[Sign In]` button.
*   **Logged-In Users:**
    *   **Left:** Current Chat/Session Name with a `[▼]` dropdown icon.
        *   **Dropdown Menu:** `Rename Session`, `Delete Session`.
    *   **Right:** Clean; no primary navigation elements.

### 1.2. Left Sidebar

Collapsible sidebar with distinct states and content for logged-in vs. logged-out users. Uses icons specified in `DESIGN.MD`. Text labels appear only in expanded mode.

*   **Collapsed State:** Shows only icons. Width is minimal.
*   **Expanded State:** Shows icons and text labels. Sema AI Logo appears at the top-right *within the sidebar panel* (hidden when collapsed).

**Elements (Top to Bottom - Logged-In Users):**

1.  **Hamburger Toggle Icon (`☰`):** Always visible. Toggles sidebar expand/collapse.
2.  **New Session Button:**
    *   **Button Appearance:** Solid black circular background.
    *   **Icon:** Plus symbol (`+`) icon (e.g., white or light gray, contrasting with the black button background).
    *   **Expanded Label:** "New Session".
3.  **Recent Activity/History Icon (`Clock` Icon):**
    *   **Expanded Label:** "Recents".
    *   **Functionality:** Filters/highlights recent items in the "Full History List" or opens a quick recents popover.
4.  **Learn/Blog Icon (`Mortarboard`, `Open Book`, or `Lightbulb` Icon):**
    *   **Expanded Label:** "Learn".
    *   **Functionality:** Links to learning resources/blog.
5.  **Full History List (Expanded Mode Only):**
    *   A scrollable list of past sessions. Not represented by an icon in collapsed mode.
6.  **About Sema AI Button:**
    *   **Icon:** `(i)` (Letter 'i' in a circle) icon.
    *   **Expanded Label:** "About Sema AI".
7.  **User Profile Icon (`User/Avatar` Icon):**
    *   **Expanded Label:** User's Name (optional).
    *   **Functionality:** Opens a pop-up/dialog menu with `Settings` and `Logout`.

**Sidebar for Logged-Out Users:**
*   Includes: Hamburger Toggle, New Session Button, Learn/Blog Icon, About Sema AI Button.
*   Excludes: Recent Activity/History Icon, Full History List, User Profile Icon (or it's replaced by a "Sign In" prompt if not in Top Bar).

### 1.3. Main Content Area

*   **"Before First Query" View:** The Input Area (see 1.4) is vertically and horizontally centered. The animated "Experience AI in your native language" message is displayed prominently above or below it.
*   **"After First Query" View:** The Input Area is docked to the bottom. The area above displays the scrollable Conversation View.

### 1.4. Input Area

A distinct horizontal bar with a uniform background color (e.g., light gray `#F0F0F0`).

**Structure (Left to Right):**
+------------------------------------------------------------------------------------+
|[ Type your query... ]                                                      |
| [+] [☰ sliders] [Chat Icon] [Translate Icon]                          [●↑] |
+------------------------------------------------------------------------------------+


1.  **`[⊕]` Document Upload Button (Icon: Plus symbol):** For uploading files.
2.  **`[☰ sliders]` Parameters/Settings Icon (Icon: Two horizontal sliders with knobs):**
    *   **Translate Mode:** Opens language selection modal (Input Lang, Target Lang, Swap).
    *   **Chat Mode:** May offer chat-specific settings or be disabled/hidden.
3.  **`[Chat Icon]` Chat Mode Button (Icon: Speech bubble):** Toggles to Chat Mode. Visually indicates active state.
4.  **`[Translate Icon]` Translate Mode Button (Icon: 'A文' style or abstract language chars):** Toggles to Translate Mode. Visually indicates active state.
5.  **Text Input Field:**
    *   Flexible width. Multi-line, expands vertically to a max height.
    *   Placeholder text adapts to mode (e.g., "Translate..." or "Message Sema AI...").
    *   Supports `@language_name` for quick target language setting in Translate Mode.
    *   Internal background may be white (`#FFFFFF`) or a shade lighter than the input bar for differentiation, with a subtle border.
6.  **`[●↑]` Send Button (Icon: Upward arrow within a circle):**
    *   **Appearance:**
        *   Default: Gray circle, gray arrow.
        *   Active (text/file present): Black circle, white arrow (or vice-versa), or darker gray with black arrow.
        *   Disabled: Lighter gray.

## 2. Key UI Components & Interactions

### 2.1. Conversation View (Chat Area)

*   **General:** No AI logos, names, or message timestamps in the primary view.
*   **User Messages:**
    *   **Alignment:** Right.
    *   **Background:** Light gray (e.g., `#F0F0F0`) with subtle border or distinct from AI messages. Text: Black.
    *   **Actions (On hover below message):**
        *   **Copy Icon:** Tooltip "Copy text". On click: icon changes to "Copied!" state (e.g., checkmark) briefly.
        *   **Edit Icon:** Tooltip "Edit message".
*   **AI Messages/Translations:**
    *   **Alignment:** Left.
    *   **Background:** White (`#FFFFFF`) with subtle border or distinct from user messages. Text: Black.
    *   **Loading State:** Animated three-dot "typing indicator" (dark gray/black dots) in an empty bubble.
    *   **Actions (On hover below *loaded* message):**
        *   **Redo/Regenerate Icon (Circular arrow):** Tooltip "Regenerate response".
        *   **Copy Icon:** As above.
        *   **Thumbs Up Icon:** Tooltip "Good response".
        *   **Thumbs Down Icon:** Tooltip "Bad response".

### 2.2. Language Selection Modal

*   **Trigger:** Clicking `[☰ sliders]` icon in Translate Mode.
*   **Appearance:** Wide panel overlay (monochromatic).
*   **Content:** Search bar at the top; scrollable list of languages (potentially grouped/categorized).

### 2.3. User Profile Dropdown/Dialog

*   **Trigger:** Clicking User Profile Icon in the sidebar.
*   **Content:** `Settings`, `Logout` options.

### 2.4. Session Management Dropdown (Top Bar)

*   **Trigger:** Clicking `▼` next to session name.
*   **Content:** `Rename Session`, `Delete Session`.

### 2.5. Tooltips

*   Mandatory for all icon-only buttons (sidebar collapsed, message actions, input area icons).
*   Simple text (e.g., "New Session") on a contrasting background.

### 2.6. Skeleton Loading Screens

*   Used for initial page load and when fetching extensive history.
*   Mimic the layout of content (e.g., grayed-out message bubbles, sidebar list items) with subtle animation (e.g., pulse/shimmer).

### 2.7. Animations & Transitions

*   **Sidebar:** Smooth slide for expand/collapse. Labels fade in/out.
*   **Modals:** Gentle fade-in/scale-up.
*   **Loading Indicators:** Subtle animation for the three-dot AI typing indicator.
*   **Button Feedback:** Subtle visual change on press for icon buttons.

## 3. Icon Specifications (Summary)

*   Use line icons from a consistent library (NO EMOJIS). Refer to `DESIGN.MD` for style and color.
    *   **Hamburger:** `☰`
    *   **New Session (Icon within button):** `+`
    *   **Recents:** `Clock`
    *   **Learn:** `Mortarboard`, `Open Book`, or `Lightbulb`
    *   **About:** `(i)` (info circle)
    *   **Profile:** `User/Avatar` outline
    *   **Document Upload (Input):** `+`
    *   **Parameters (Input):** `☰ sliders` (two horizontal sliders)
    *   **Chat Mode (Input):** `Speech bubble`
    *   **Translate Mode (Input):** `A文` or similar abstract
    *   **Send (Input):** `↑` (up arrow) in circle `●`
    *   **Copy:** `Overlapping documents` or `Clipboard`
    *   **Edit:** `Pencil`
    *   **Redo/Regenerate:** `Circular arrow`
    *   **Thumbs Up/Down:** Standard `Thumb` outlines



