// Test utility for token management
import apiService from '../services/api';
import socketService from '../services/socket';

export const testTokenManagement = () => {
    console.log('=== Token Management Test ===');

    // Test 1: Check current tokens
    console.log('1. Current tokens:');
    console.log('   Access Token:', apiService.getAccessToken() ? 'Present' : 'Missing');
    console.log('   Refresh Token:', apiService.getRefreshToken() ? 'Present' : 'Missing');

    // Test 2: Test API call with token
    console.log('2. Testing API call...');
    apiService.getAllCards()
        .then(cards => {
            console.log('   ✅ API call successful, got', cards.length, 'cards');
        })
        .catch(error => {
            console.log('   ❌ API call failed:', error.message);
        });

    // Test 3: Test socket connection
    console.log('3. Testing socket connection...');
    try {
        const socket = socketService.connect();
        console.log('   ✅ Socket connection initiated');

        socket.on('connect', () => {
            console.log('   ✅ Socket connected successfully');
        });

        socket.on('connect_error', (error) => {
            console.log('   ❌ Socket connection failed:', error.message);
        });
    } catch (error) {
        console.log('   ❌ Socket connection error:', error.message);
    }

    // Test 4: Test token refresh (simulate expired token)
    console.log('4. Testing token refresh...');
    if (apiService.getRefreshToken()) {
        apiService.refreshAccessToken()
            .then(newToken => {
                console.log('   ✅ Token refresh successful');
            })
            .catch(error => {
                console.log('   ❌ Token refresh failed:', error.message);
            });
    } else {
        console.log('   ⚠️ No refresh token available');
    }
};

// Auto-run test if in development
if (import.meta.env.DEV) {
    setTimeout(testTokenManagement, 1000);
}
