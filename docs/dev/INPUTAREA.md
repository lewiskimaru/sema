# Sema AI - Input Area UI/UX Specifications

This document provides a detailed breakdown of the design, components, states, and interactions for the Sema AI input area. This area is a critical component for user interaction, facilitating text input, mode selection, parameter adjustments, document uploads, and message submission, structured in a clear two-row layout.

## 1. Overview & Placement

The input area consists of two distinct horizontal rows, stacked vertically. Its placement is contextual:

*   **"Before First Query" View:** The entire two-row input area block is vertically and horizontally centered on the screen to maximize initial focus and invite user interaction.
*   **"After First Query" View:** The entire two-row input area block is docked to the bottom of the screen, a standard position for ongoing chat/messaging interfaces.

## 2. Visual Design & Color Palette

*   **Overall Input Area Background:** The container for both rows can share a consistent light gray background (e.g., `#F0F0F0` or `#EAEAEA`) from the application's monochromatic palette.
*   **Top Row (Text Input Field):**
    *   **Background:** May be white (`#FFFFFF`) or a slightly lighter shade than the overall input area background to visually differentiate it. Can also share the same background as the overall bar but with a clear border.
    *   **Border:** A subtle, thin gray border (e.g., `#DCDCDC`).
*   **Bottom Row (Action Buttons):** Shares the overall input area background color, creating a unified base for controls.
*   **Icons:** Dark gray (`#333333`) or black (`#000000`) line icons. No emojis.
*   **Text:** Black (`#000000`) for input, dark gray (`#555555`) for placeholder text.
*   **Focus State:** The text input field should have a clear focus indicator (e.g., a thicker or darker border, such as 2px solid black). Icon buttons may have a subtle background change or border emphasis on focus/hover.
*   **Drag-and-Drop Visual Feedback:** When a file is dragged over the input area (specifically the Text Input Field or the entire input block), a visual cue such as a dashed border around the drop zone and/or a semi-transparent overlay with a "Drop file here" message should appear.

## 3. Structure & Components

The input area is structured into two vertically stacked rows:

**Row 1: Text Input Field**
**Row 2: Action Buttons Bar**

**Visual Layout:**

+------------------------------------------------------------------------------------+
| [ E - Text Input Field ] |
+------------------------------------------------------------------------------------+
| [A] [B] [C] [D] [F] |
+------------------------------------------------------------------------------------+


---

### Component Breakdown:

#### Row 1: [E] Text Input Field

*   **Appearance:**
    *   Occupies the full width of its row.
    *   Multi-line by default, allowing users to press `Enter`/`Return` for a new line.
    *   Expands vertically as the user types, up to a defined maximum height (e.g., 5-7 lines of text), after which it becomes internally scrollable.
*   **Placeholder Text:** Dynamically changes based on the active mode and context:
    *   **Translate Mode (Default):** "Enter text to translate, drag & drop a file, or use @ to set target language"
    *   **Chat Mode (Default):** "Message Sema AI or drag & drop a file..."
    *   **Document Staged:** "Add a message for your document (optional)"
*   **Functionality:**
    *   Primary area for users to type their queries, text for translation, or messages.
    *   **Drag-and-Drop Zone:** This field (or the entire input area block) acts as a primary drop zone for files.
    *   **`@language_name` Shortcut (Translate Mode):** Typing `@` followed by a language name (e.g., `@Spanish`) triggers an autocomplete suggestion list for target languages. Selecting one from the list sets the target language for the current translation query.

---

#### Row 2: Action Buttons Bar

This row contains all the interactive control buttons. Buttons are grouped logically: file/mode/settings controls on the left/center, and the send action on the far right.

**Left/Center Group:**

##### A. `[⊕]` Document Upload Button
*   **Icon:** Plus symbol (`+`) line icon.
*   **Functionality:** Opens the system's file dialog for users to select documents (e.g., `.txt`, `.pdf`, `.docx`). This complements the drag-and-drop functionality.
*   **State:**
    *   Enabled by default.
*   **Tooltip:** "Upload document" on hover.

##### B. `[☰ sliders]` Parameters/Settings Icon
*   **Icon:** Two horizontal sliders with knobs (line art style, representing adjustment or settings).
*   **Functionality:**
    *   **In Translate Mode:** Opens a modal or dropdown for detailed language selection (Input Language, Target Language, Swap Languages button). This is the primary way to access comprehensive language settings.
    *   **In Chat Mode:** May offer chat-specific AI settings (e.g., AI personality, response style), be disabled, or be hidden if no chat-specific parameters are configurable for that mode.
*   **State:** Enabled/disabled or visible/hidden based on the active mode (Translate/Chat).
*   **Tooltip:** "Translation settings" or "Chat settings" (dynamically reflecting the current mode) on hover.

##### C. `[Chat Icon]` Chat Mode Button
*   **Icon:** Speech bubble line icon.
*   **Functionality:** Toggles the application into "Chat Mode."
*   **State:**
    *   **Active:** Visually distinct (e.g., darker icon, subtle background fill for the button area, or a bottom/top border highlight on the icon button itself) to indicate Chat Mode is selected.
    *   **Inactive:** Default icon appearance.
*   **Tooltip:** "Switch to Chat Mode" on hover.

##### D. `[Translate Icon]` Translate Mode Button
*   **Icon:** Abstract language representation (e.g., 'A文' style, or two distinct characters like 'A' and 'あ') line icon.
*   **Functionality:** Toggles the application into "Translate Mode."
*   **State:**
    *   **Active:** Visually distinct (as above for Chat Icon) to indicate Translate Mode is selected.
    *   **Inactive:** Default icon appearance.
*   **Tooltip:** "Switch to Translate Mode" on hover.

**Far Right:**

##### F. `[●↑]` Send Button
*   **Icon:** Upward-pointing arrow (`↑`) line icon, typically centered within a circular button shape.
*   **Functionality:** Submits the content of the text input field and/or any staged document to the AI for processing (translation or chat response).
*   **State:**
    *   **Disabled:** When the text input field is empty AND no document is staged. Visually indicated (e.g., lighter gray icon and/or button background).
    *   **Enabled (Default/Inactive Appearance):** When text is present in the input field or a document is staged, but the button is not actively being hovered or pressed (e.g., Gray circle background, gray arrow icon).
    *   **Enabled (Active/Hover Appearance):** When interactive and hovered over (e.g., Black circle background, white arrow icon, or a darker gray circle background with a black arrow icon, providing strong visual feedback).
*   **Tooltip:** "Send message" or "Translate" (dynamically reflecting the current mode) on hover when enabled.

## 4. Interactions & Behavior

*   **Mode Toggling (`[Chat Icon]` / `[Translate Icon]`):**
    *   Only one mode (Chat or Translate) can be active at a time. Clicking one deactivates the other.
    *   The active mode button must have a persistent visual indicator.
    *   Toggling modes may change the relevance/visibility of the `[☰ sliders]` Parameters Icon and will update the placeholder text in the Text Input Field.
*   **Parameter Settings (`[☰ sliders]`):**
    *   Clicking this icon when in Translate Mode opens the Language Selection Modal.
    *   The modal overlays part of the screen and allows selection of input/target languages and includes a swap button.
*   **Document Upload:**
    *   **Via `[⊕]` Button:** Opens the system file dialog for selection.
    *   **Via Drag-and-Drop:**
        1.  User drags a file over the designated drop zone (Text Input Field or the entire input area block).
        2.  Clear visual feedback appears on the drop zone (e.g., dashed border highlight, "Drop file to upload" overlay message).
        3.  On successful drop, the file is staged for processing.
        4.  Handle single file drops initially. For multiple files, define behavior (e.g., process first, queue, or disallow).
    *   **Staging Feedback:** After a document is selected (via button or drag-and-drop), a visual indicator (e.g., a small chip with the filename and an 'x' to remove it) should appear, typically above or within the Text Input Field, or in a dedicated staging area if space allows.
    *   The Send button `[●↑]` becomes enabled once a document is staged.
*   **Text Input & Send:**
    *   The Send button `[●↑]` enables as soon as there is text in the input field OR a document is staged.
    *   Pressing `Enter` in the Text Input Field should primarily create a new line to support multi-line messages. Submission of the query/message should be explicitly via the Send button `[●↑]`.
*   **Responsive Behavior:**
    *   The Text Input Field (Row 1) should be fully responsive to the width of its container.
    *   The Action Buttons Bar (Row 2) should maintain its layout, with the left/center group of buttons and the far-right Send button anchored appropriately.
*   **Tooltips:** All icon-only buttons (`[⊕]`, `[☰ sliders]`, `[Chat Icon]`, `[Translate Icon]`, `[●↑]`) must display a descriptive tooltip on mouse hover to clarify their function. Tooltips should be simple, black text on a light gray background, adhering to the monochromatic theme.

This specification for the input area, featuring a two-row layout and drag-and-drop document handling, aims to provide a clear, efficient, and user-friendly interface for Sema AI.