// Test script to verify guest mode functionality
// Run this in the browser console on http://localhost:3001

console.log('🧪 Testing Guest Mode Functionality');

// Test 1: Check initial state
function testInitialState() {
    console.log('\n📋 Test 1: Initial State');
    
    const user = localStorage.getItem('semaUser');
    const guest = localStorage.getItem('semaGuestSession');
    
    console.log('User session:', user);
    console.log('Guest session:', guest);
    
    if (!user && guest) {
        const guestData = JSON.parse(guest);
        console.log('✅ Guest session exists with query count:', guestData.queryCount);
    } else {
        console.log('❌ Expected guest session but found user session or no session');
    }
}

// Test 2: Clear storage and reload
function testFreshStart() {
    console.log('\n🔄 Test 2: Fresh Start');
    localStorage.clear();
    console.log('Storage cleared. Reload the page to test fresh guest experience.');
    console.log('Expected: Guest mode should initialize with 0/5 queries');
}

// Test 3: Simulate query progression
function testQueryProgression() {
    console.log('\n📈 Test 3: Query Progression');
    
    // Set guest session to 4 queries
    localStorage.setItem('semaGuestSession', JSON.stringify({
        queryCount: 4,
        startTime: Date.now(),
        hasSeenSignupPrompt: false
    }));
    
    console.log('Set guest session to 4 queries. Reload and make 1 query to test signup prompt.');
}

// Test 4: Test signup prompt dismissal
function testSignupPromptDismissal() {
    console.log('\n🚫 Test 4: Signup Prompt Dismissal');
    
    localStorage.setItem('semaGuestSession', JSON.stringify({
        queryCount: 7,
        startTime: Date.now(),
        hasSeenSignupPrompt: true
    }));
    
    console.log('Set guest session to 7 queries with prompt seen. Reload to test continued usage.');
}

// Test 5: Test user login simulation
function testUserLogin() {
    console.log('\n👤 Test 5: User Login Simulation');
    
    localStorage.setItem('semaUser', JSON.stringify({
        email: 'test@example.com',
        name: 'Test User',
        isLoggedIn: true
    }));
    
    console.log('Set user session. Reload to test authenticated mode.');
}

// Run all tests
function runAllTests() {
    console.log('🚀 Running all guest mode tests...');
    testInitialState();
    
    console.log('\n📝 Manual test steps:');
    console.log('1. Run testFreshStart() and reload');
    console.log('2. Make 5 queries and verify signup prompt appears');
    console.log('3. Run testQueryProgression() and reload');
    console.log('4. Make 1 query and verify signup prompt');
    console.log('5. Run testUserLogin() and reload');
    console.log('6. Verify authenticated mode (no guest indicators)');
}

// Auto-run initial test
testInitialState();

// Export functions to global scope for manual testing
window.testGuestMode = {
    testInitialState,
    testFreshStart,
    testQueryProgression,
    testSignupPromptDismissal,
    testUserLogin,
    runAllTests
};

console.log('\n🔧 Available test functions:');
console.log('- testGuestMode.testInitialState()');
console.log('- testGuestMode.testFreshStart()');
console.log('- testGuestMode.testQueryProgression()');
console.log('- testGuestMode.testSignupPromptDismissal()');
console.log('- testGuestMode.testUserLogin()');
console.log('- testGuestMode.runAllTests()');
