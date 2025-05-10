## Sema Translator Web Application - User Stories

**Epic: User Authentication & Account Management**

1.  **US-AUTH-001 (Registration):**
    *   **As a** new visitor,
    *   **I want to** be able to register for an account using my email, a password, and a display name,
    *   **so that** I can access personalized features like chat and history.
2.  **US-AUTH-002 (Login):**
    *   **As a** registered user,
    *   **I want to** be able to log in with my email and password,
    *   **so that** I can access my account and its features.
3.  **US-AUTH-003 (Persistent Login):**
    *   **As a** logged-in user,
    *   **I want to** remain logged in across browser sessions (e.g., for several days or weeks) without having to re-enter my credentials frequently,
    *   **so that** I have a convenient and seamless experience.
4.  **US-AUTH-004 (Logout):**
    *   **As a** logged-in user,
    *   **I want to** be able to log out of my account,
    *   **so that** I can secure my session on a shared computer.
5.  **US-AUTH-005 (Profile View):**
    *   **As a** logged-in user,
    *   **I want to** view my profile information (e.g., display name, email, preferred language),
    *   **so that** I can confirm my details.
6.  **US-AUTH-006 (Profile Update):**
    *   **As a** logged-in user,
    *   **I want to** be able to update my display name and preferred language,
    *   **so that** my profile reflects my current information and preferences.
7.  **US-AUTH-007 (Password Change):**
    *   **As a** logged-in user,
    *   **I want to** be able to change my password by providing my current password and a new password,
    *   **so that** I can maintain the security of my account.
8.  **US-AUTH-008 (Password Reset - Basic):**
    *   **As a** user who forgot my password,
    *   **I want to** be able to request a password reset link to be sent to my registered email address,
    *   **so that** I can regain access to my account.

---

**Epic: Text Translation**

9.  **US-TRANS-001 (Basic Translation - No Login):**
    *   **As a** visitor (unauthenticated user),
    *   **I want to** instantly translate a piece of text by typing or pasting it, selecting a target language, and seeing the translation,
    *   **so that** I can quickly understand or communicate in another language without needing an account.
10. **US-TRANS-002 (Auto-Detect Source Language):**
    *   **As a** user performing a translation,
    *   **I want the system to** automatically detect the source language of my input text by default,
    *   **so that** I don't have to manually select it if I'm unsure or for convenience.
11. **US-TRANS-003 (Manual Source Language Selection):**
    *   **As a** user performing a translation,
    *   **I want to** be able to manually select the source language from a list,
    *   **so that** I can ensure accuracy if auto-detection is incorrect or if I know the source language.
12. **US-TRANS-004 (Target Language Selection):**
    *   **As a** user performing a translation,
    *   **I want to** select the target language from a comprehensive list,
    *   **so that** I can translate my text into the desired language.
13. **US-TRANS-005 (Swap Languages):**
    *   **As a** user performing a translation,
    *   **I want to** be able to quickly swap the source and target languages (and their respective texts),
    *   **so that** I can easily translate back and forth or correct an initial selection.
14. **US-TRANS-006 (Translation Progress Indication):**
    *   **As a** user waiting for a translation,
    *   **I want to** see a visual indicator (e.g., loading spinner, progress bar) showing that the translation is in progress,
    *   **so that** I know the system is working and I'm not left wondering.
15. **US-TRANS-007 (Copy Translated Text):**
    *   **As a** user viewing a translation,
    *   **I want to** easily copy the translated text to my clipboard,
    *   **so that** I can use it in other applications.
16. **US-TRANS-008 (Clear Input/Output):**
    *   **As a** user performing multiple translations,
    *   **I want to** easily clear the input and output text fields,
    *   **so that** I can start a new translation quickly.
17. **US-TRANS-009 (Translation History - Authenticated):**
    *   **As an** authenticated user,
    *   **I want my translations to be** automatically saved to my history,
    *   **so that** I can refer back to them later. *(See History Epic for viewing)*

---

**Epic: Multilingual Chat (Requires Authentication)**

18. **US-CHAT-001 (Access Chat):**
    *   **As an** authenticated user,
    *   **I want to** access the chat feature,
    *   **so that** I can communicate with the AI assistant.
19. **US-CHAT-002 (Send Message):**
    *   **As an** authenticated user in a chat session,
    *   **I want to** type a message in my preferred language and send it to the AI assistant,
    *   **so that** I can ask questions or have a conversation.
20. **US-CHAT-003 (Receive Response in My Language):**
    *   **As an** authenticated user in a chat session,
    *   **I want to** receive responses from the AI assistant in the same language I used for my input,
    *   **so that** the conversation is seamless and understandable.
21. **US-CHAT-004 (AI "Thinking" Indicator):**
    *   **As an** authenticated user waiting for a chat response,
    *   **I want to** see a visual indicator (e.g., animated dots, "typing..." message) that the AI is processing my request and generating a response,
    *   **so that** I know the system is active.
22. **US-CHAT-005 (View Chat History within Session):**
    *   **As an** authenticated user in a chat session,
    *   **I want to** see the history of messages (my inputs and AI responses) in the current conversation,
    *   **so that** I can follow the context of the discussion.
23. **US-CHAT-006 (Start New Chat Session):**
    *   **As an** authenticated user,
    *   **I want to** be able to start a new, separate chat session,
    *   **so that** I can discuss different topics without them mixing.
24. **US-CHAT-007 (Chat History Saved - Authenticated):**
    *   **As an** authenticated user,
    *   **I want my chat sessions to be** automatically saved,
    *   **so that** I can review them later. *(See History Epic for viewing)*

---

**Epic: History (Requires Authentication)**

25. **US-HIST-001 (View Translation History):**
    *   **As an** authenticated user,
    *   **I want to** access a page listing my past translations, showing snippets of original/translated text, languages, and date,
    *   **so that** I can review my previous translation activity.
26. **US-HIST-002 (Filter/Sort Translation History):**
    *   **As an** authenticated user viewing my translation history,
    *   **I want to** be able to filter or sort my translations (e.g., by date, language pair),
    *   **so that** I can find specific translations more easily.
27. **US-HIST-003 (Delete Translation Entry):**
    *   **As an** authenticated user viewing my translation history,
    *   **I want to** be able to delete individual translation entries,
    *   **so that** I can manage my history and remove unwanted items.
28. **US-HIST-004 (View Chat Session List):**
    *   **As an** authenticated user,
    *   **I want to** access a page listing my past chat sessions, showing a title/summary and date,
    *   **so that** I can see an overview of my conversations.
29. **US-HIST-005 (View Full Chat Session from History):**
    *   **As an** authenticated user viewing my chat session list,
    *   **I want to** be able to click on a session to view the full conversation transcript (read-only),
    *   **so that** I can recall the details of a past discussion.
30. **US-HIST-006 (Delete Chat Session):**
    *   **As an** authenticated user viewing my chat session list,
    *   **I want to** be able to delete entire chat sessions,
    *   **so that** I can manage my chat history.

---

**Epic: Language Discovery & Landing Page Features**

31. **US-LANG-001 (View Supported Languages):**
    *   **As a** visitor or user,
    *   **I want to** see a list or visual representation of languages supported by the translation service,
    *   **so that** I know if my required languages are available.
32. **US-LANG-002 (Interactive Language Map):**
    *   **As a** visitor or user on the landing page,
    *   **I want to** interact with a world map where I can click on regions or countries,
    *   **so that** I can discover languages spoken there and be directed to translate with relevant language options pre-selected/filtered.
33. **US-LANDING-001 (Discover Chat Feature):**
    *   **As a** visitor on the landing page,
    *   **I want to** easily discover the chat feature through clear navigation or visual cues (e.g., tabs),
    *   **so that** I am aware of this advanced capability.
34. **US-FOOTER-001 (Access Informational Links):**
    *   **As a** visitor or user,
    *   **I want to** find links in the footer for "About Us," "API Documentation," "Sema Mission," "Terms of Service," and "Privacy Policy,"
    *   **so that** I can learn more about the platform and its policies.

---

**Epic: Commercial API Key Management (Requires Authentication & Subscription - if applicable)**

35. **US-APIKEY-001 (View API Keys):**
    *   **As an** authenticated user with API access,
    *   **I want to** view a list of my API keys, showing their name, prefix, creation date, and status,
    *   **so that** I can manage my integrations.
36. **US-APIKEY-002 (Generate API Key):**
    *   **As an** authenticated user with API access,
    *   **I want to** generate a new API key, give it a name, and (optionally) assign scopes, and be shown the full key *once*,
    *   **so that** I can use it to access the commercial API.
37. **US-APIKEY-003 (Revoke API Key):**
    *   **As an** authenticated user with API access,
    *   **I want to** revoke an existing API key,
    *   **so that** it can no longer be used to access the API.
38. **US-APIKEY-004 (View API Usage - Basic):**
    *   **As an** authenticated user with API access,
    *   **I want to** see a basic overview of my API usage (e.g., number of requests, characters translated),
    *   **so that** I can monitor my consumption.
