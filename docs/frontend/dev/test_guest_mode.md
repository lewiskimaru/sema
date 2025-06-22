# Guest Mode Testing Guide

## Test Scenarios

### 1. Initial Guest Mode Access
**Steps:**
1. Open browser in incognito/private mode
2. Navigate to http://localhost:3001
3. Verify you can access the app without login

**Expected Results:**
- App loads directly to main interface (no login redirect)
- Top bar shows "Guest Mode (0/5)" indicator
- Welcome message shows guest-specific content
- Sidebar does not show "Recents" section
- User dropdown shows "Sign Up" option

### 2. Query Counting
**Steps:**
1. Type a message in the input area
2. Send the message
3. Observe the query counter
4. Repeat 4 more times (total 5 queries)

**Expected Results:**
- Counter updates after each query: (1/5), (2/5), etc.
- Counter is visible in both top bar and welcome screen
- After 5th query, signup prompt modal appears

### 3. Signup Prompt Behavior
**Steps:**
1. Make 5 queries to trigger the prompt
2. Test each option in the modal:
   - "Sign Up for Free" button
   - "Continue as Guest" button
   - "Maybe later" link

**Expected Results:**
- Modal appears after exactly 5 queries
- "Sign Up" redirects to signup page
- "Continue as Guest" closes modal and allows continued use
- "Maybe later" closes modal
- Modal only appears once per session

### 4. Signup Flow from Guest Mode
**Steps:**
1. Start as guest user
2. Make a few queries
3. Click "Sign Up" from user dropdown or signup prompt
4. Complete signup form
5. Verify transition to authenticated state

**Expected Results:**
- Signup form pre-populates or shows guest context
- After signup, guest session is cleared
- Top bar no longer shows guest mode indicator
- "Recents" section appears in sidebar
- User dropdown shows "Profile" and "Sign Out"

### 5. Session Persistence
**Steps:**
1. Start as guest and make 2 queries
2. Refresh the page
3. Make 2 more queries
4. Close and reopen browser tab
5. Make 1 more query

**Expected Results:**
- Query count persists across page refreshes
- Query count persists across tab close/reopen
- 5th query triggers signup prompt as expected

### 6. Logout to Guest Mode
**Steps:**
1. Log in as authenticated user
2. Use the application normally
3. Log out using the user dropdown
4. Verify return to guest mode

**Expected Results:**
- After logout, app shows guest mode interface
- New guest session is created (0/5 queries)
- All guest mode features are available

## Browser Console Testing

### Check Guest Session Data
```javascript
// View current guest session
console.log(JSON.parse(localStorage.getItem('semaGuestSession')));

// Reset guest session
localStorage.removeItem('semaGuestSession');

// Manually set query count
localStorage.setItem('semaGuestSession', JSON.stringify({
  queryCount: 4,
  startTime: Date.now(),
  hasSeenSignupPrompt: false
}));
```

### Simulate Different States
```javascript
// Simulate user about to hit limit
localStorage.setItem('semaGuestSession', JSON.stringify({
  queryCount: 4,
  startTime: Date.now(),
  hasSeenSignupPrompt: false
}));

// Simulate user who has seen prompt
localStorage.setItem('semaGuestSession', JSON.stringify({
  queryCount: 7,
  startTime: Date.now(),
  hasSeenSignupPrompt: true
}));
```

## Expected Behavior Summary

### Guest Mode Features
✅ Immediate access without login
✅ Query counting (0-5)
✅ Visual indicators in UI
✅ Signup prompts after 5 queries
✅ Seamless transition to authenticated mode
✅ Session persistence across browser sessions
✅ Proper cleanup on login/logout

### UI Elements for Guests
✅ "Guest Mode (X/5)" in top bar
✅ Guest welcome message
✅ "Sign Up" in user dropdown
✅ Hidden "Recents" sidebar section
✅ Signup prompt modal

### Conversion Flow
✅ Non-intrusive prompts
✅ Multiple signup entry points
✅ Clear value proposition
✅ Easy dismissal options
✅ Preserved user context

## Troubleshooting

### Common Issues
1. **Counter not updating**: Check browser console for JavaScript errors
2. **Prompt not appearing**: Verify localStorage data and query count
3. **Session not persisting**: Check if localStorage is enabled
4. **UI not updating**: Ensure React state is properly synchronized

### Debug Commands
```javascript
// Check current state
console.log('Guest session:', localStorage.getItem('semaGuestSession'));
console.log('User session:', localStorage.getItem('semaUser'));

// Force trigger signup prompt
localStorage.setItem('semaGuestSession', JSON.stringify({
  queryCount: 5,
  startTime: Date.now(),
  hasSeenSignupPrompt: false
}));
// Then refresh page and make a query
```
