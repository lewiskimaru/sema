# Guest Mode Implementation

## Overview
This implementation adds guest mode functionality to the Sema AI application, allowing users to try the application without signing up first. After 5 queries, users are prompted to sign up for continued access.

## Features Implemented

### 1. Guest Session Management
- **Guest Session Tracking**: Uses localStorage to track guest sessions with query count, start time, and signup prompt status
- **Automatic Initialization**: Guest session is automatically created when no user authentication is found
- **Query Counting**: Tracks the number of queries made by guest users

### 2. UI Changes
- **Guest Mode Indicator**: Shows "Guest Mode (X/5)" in the top bar for guest users
- **Welcome Message**: Special welcome message for guest users explaining the 5-query limit
- **Sidebar Modifications**: Hides "Recents" section for guest users (since they can't save history)
- **User Dropdown**: Shows "Sign Up" option instead of "Profile" for guest users

### 3. Signup Prompt System
- **Automatic Trigger**: Shows signup prompt after the 5th query
- **Modal Interface**: Clean modal with options to sign up or continue as guest
- **One-time Display**: Tracks if the prompt has been shown to avoid repeated interruptions
- **Benefits Highlight**: Lists benefits of signing up (unlimited queries, saved history, premium features)

### 4. Routing and Authentication
- **Flexible Access**: Allows access to main application for both authenticated and guest users
- **Seamless Transition**: Users can sign up from guest mode and continue using the app
- **Session Cleanup**: Clears guest session data when user logs in

## Technical Implementation

### State Management
```javascript
// App.tsx - Main state management
const [isLoggedIn, setIsLoggedIn] = useState(false);
const [isGuest, setIsGuest] = useState(false);
const [guestQueryCount, setGuestQueryCount] = useState(0);
```

### Guest Session Structure
```javascript
{
  queryCount: 0,
  startTime: Date.now(),
  hasSeenSignupPrompt: false
}
```

### Key Components Modified
1. **App.tsx**: Main routing and state management
2. **TopBar**: Guest mode indicator and user dropdown
3. **Sidebar**: Conditional rendering for guest users
4. **MainContent**: Query counting and signup prompt logic
5. **WelcomeView**: Guest-specific welcome message
6. **LoginPage/SignupPage**: Callback integration for seamless transitions

## User Flow

### Guest User Journey
1. **First Visit**: User lands on the app and can immediately start using it
2. **Query Tracking**: Each query is counted and displayed in the UI
3. **Signup Prompt**: After 5 queries, user sees a modal encouraging signup
4. **Continued Usage**: User can choose to sign up or continue as guest
5. **Account Creation**: If user signs up, guest session is cleared and they become authenticated

### Benefits for Users
- **Immediate Access**: No friction to start using the application
- **Try Before Commit**: Users can evaluate the service before creating an account
- **Gentle Encouragement**: Non-intrusive signup prompts after demonstrating value
- **Seamless Transition**: Easy path from guest to authenticated user

## Configuration

### Query Limit
The 5-query limit can be easily modified by changing the condition in `MainContent.tsx`:
```javascript
if (sessionData.queryCount >= 5 && !sessionData.hasSeenSignupPrompt) {
  setShowSignupPrompt(true);
}
```

### Guest Session Storage
Guest sessions are stored in localStorage under the key `semaGuestSession`. This persists across browser sessions but is cleared when the user signs up or logs in.

## Future Enhancements

### Potential Improvements
1. **Extended Trial**: Allow more queries for users who dismiss the signup prompt
2. **Feature Limitations**: Restrict certain features to authenticated users only
3. **Analytics**: Track guest user behavior and conversion rates
4. **Progressive Disclosure**: Gradually introduce premium features as users approach the limit
5. **Social Proof**: Show testimonials or usage statistics in the signup prompt

### Technical Considerations
1. **Rate Limiting**: Implement server-side rate limiting for guest users
2. **Data Persistence**: Consider temporary server-side storage for guest sessions
3. **Security**: Ensure guest mode doesn't expose sensitive features
4. **Performance**: Monitor impact of guest sessions on application performance

## Testing

### Manual Testing Scenarios
1. **Fresh Visit**: Clear localStorage and visit the app - should show guest mode
2. **Query Counting**: Make queries and verify count updates in UI
3. **Signup Prompt**: Make 5 queries and verify prompt appears
4. **Signup Flow**: Complete signup from guest mode and verify session cleanup
5. **Logout Flow**: Log out and verify return to guest mode

### Edge Cases
1. **Corrupted Session**: Handle invalid localStorage data gracefully
2. **Multiple Tabs**: Ensure consistent behavior across browser tabs
3. **Browser Refresh**: Verify guest session persists across page reloads
4. **Signup Dismissal**: Test behavior when user dismisses signup prompt multiple times

## Conclusion

This implementation provides a smooth onboarding experience that reduces friction for new users while encouraging account creation after demonstrating value. The guest mode is fully functional and maintains the core user experience while tracking usage and providing appropriate prompts for conversion.
