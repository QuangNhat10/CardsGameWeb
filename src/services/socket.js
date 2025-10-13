import { io } from 'socket.io-client';
import { URL } from './api.js';

// Ensure we never connect to localhost in production builds
const isBrowser = typeof window !== 'undefined';
const isLocalHost = isBrowser && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '0.0.0.0'
);
const RENDER_URL = 'https://gamethebaiteam3-backend.onrender.com';
const EFFECTIVE_URL = (!isLocalHost && /localhost|127\.0\.0\.1|0\.0\.0\.0/i.test(String(URL)))
    ? RENDER_URL
    : URL;

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
    }

    // Get access token from localStorage
    getAccessToken() {
        try {
            return localStorage.getItem('accessToken');
        } catch (error) {
            console.warn('Failed to get access token from localStorage:', error);
            return null;
        }
    }

    // Get refresh token from localStorage
    getRefreshToken() {
        try {
            return localStorage.getItem('refreshToken');
        } catch (error) {
            console.warn('Failed to get refresh token from localStorage:', error);
            return null;
        }
    }

    // Clear tokens and redirect to login
    clearTokensAndRedirect() {
        try {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
        } catch (error) {
            console.error('Failed to clear tokens:', error);
        }
    }

    connect(providedToken) {
        if (this.socket && this.isConnected) {
            console.log('[socket] Already connected, returning existing socket');
            return this.socket;
        }

        const accessToken = providedToken || this.getAccessToken();

        // Debug token information
        console.log('[socket] Connection attempt:', {
            hasToken: !!accessToken,
            tokenLength: accessToken ? accessToken.length : 0,
            url: EFFECTIVE_URL
        });

        // If no token, try to connect without authentication
        if (!accessToken) {
            console.warn('[socket] No access token found, connecting without authentication');
            return this.connectWithoutAuth();
        }

        // Validate token format
        if (typeof accessToken !== 'string' || accessToken.trim().length === 0) {
            console.error('[socket] Invalid access token format');
            return this.connectWithoutAuth();
        }

        const authorizationHeader = accessToken.startsWith('Bearer ') ? accessToken : `Bearer ${accessToken}`;

        // Debug nhẹ để thấy payload auth (không log token thật)
        try {
            const masked = accessToken ? `${String(accessToken).slice(0, 6)}...` : 'none';
            console.log('[socket] connecting to', EFFECTIVE_URL, 'auth.accessToken=', masked);
        } catch { }

        this.socket = io(EFFECTIVE_URL, {
            transports: ['websocket'],
            timeout: 20000,
            forceNew: true,
            auth: {
                token: accessToken,
                authorization: authorizationHeader
            },
            // Add additional connection options
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 3,
            reconnectionDelay: 1000,
            // Add extra headers for authentication
            extraHeaders: {
                'Authorization': authorizationHeader
            }
        });

        this.socket.on('connect', () => {
            console.log('[socket] ✅ Connected to server:', this.socket.id);
            this.isConnected = true;

            // Gửi registerFE để thông báo frontend đã kết nối
            this.emitRegisterFE();
        });

        this.socket.on('disconnect', (reason) => {
            console.log('[socket] ❌ Disconnected from server:', reason);
            this.isConnected = false;
        });

        this.socket.on('connect_error', (error) => {
            console.error('[socket] ❌ Connection error:', {
                message: error.message,
                type: error.type,
                description: error.description,
                context: error.context
            });
            this.isConnected = false;

            // Handle token expiration with more specific checks
            const errorMessage = error.message?.toLowerCase() || '';
            const isTokenError = errorMessage.includes('token') ||
                errorMessage.includes('unauthorized') ||
                errorMessage.includes('invalid') ||
                errorMessage.includes('expired') ||
                errorMessage.includes('authentication') ||
                errorMessage.includes('chưa đăng nhập') ||
                errorMessage.includes('not logged in') ||
                error.type === 'UnauthorizedError';

            if (isTokenError) {
                console.warn('[socket] 🔐 Token authentication failed:', error.message);

                // Try to refresh token first if we have a refresh token
                const refreshToken = this.getRefreshToken();
                if (refreshToken) {
                    console.log('[socket] 🔄 Attempting token refresh...');
                    this.handleTokenRefresh().catch(() => {
                        console.warn('[socket] ❌ Token refresh failed, redirecting to login');
                        this.clearTokensAndRedirect();
                    });
                } else {
                    console.warn('[socket] ❌ No refresh token available, redirecting to login');
                    this.clearTokensAndRedirect();
                }
                return;
            }

            // Handle network/server errors
            if (error.type === 'TransportError' || error.type === 'ServerError') {
                console.warn('[socket] 🌐 Network/server error, will retry automatically');
            } else {
                console.warn('[socket] ⚠️ Unknown connection error, will retry automatically');
            }
        });

        this.socket.on('reconnect', (attemptNumber) => {
            console.log('[socket] 🔄 Reconnected after', attemptNumber, 'attempts');
            this.isConnected = true;
        });

        this.socket.on('reconnect_error', (error) => {
            console.error('[socket] ❌ Reconnection failed:', error);
        });

        this.socket.on('reconnect_failed', () => {
            console.error('[socket] ❌ All reconnection attempts failed');
            this.isConnected = false;
        });

        return this.socket;
    }

    // Connect without authentication (for public features)
    connectWithoutAuth() {
        console.log('[socket] 🔓 Connecting without authentication to:', EFFECTIVE_URL);

        this.socket = io(EFFECTIVE_URL, {
            transports: ['websocket'],
            timeout: 20000,
            forceNew: true,
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 3,
            reconnectionDelay: 1000
        });

        this.socket.on('connect', () => {
            console.log('[socket] ✅ Connected to server without authentication:', this.socket.id);
            this.isConnected = true;
        });

        this.socket.on('disconnect', (reason) => {
            console.log('[socket] ❌ Disconnected from server:', reason);
            this.isConnected = false;
        });

        this.socket.on('connect_error', (error) => {
            console.error('[socket] ❌ Connection error (no auth):', {
                message: error.message,
                type: error.type,
                description: error.description
            });
            this.isConnected = false;
        });

        this.socket.on('reconnect', (attemptNumber) => {
            console.log('[socket] 🔄 Reconnected without auth after', attemptNumber, 'attempts');
            this.isConnected = true;
        });

        this.socket.on('reconnect_error', (error) => {
            console.error('[socket] ❌ Reconnection failed (no auth):', error);
        });

        this.socket.on('reconnect_failed', () => {
            console.error('[socket] ❌ All reconnection attempts failed (no auth)');
            this.isConnected = false;
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
        }
    }

    // Card-related socket events
    onCardUpdate(callback) {
        if (this.socket) {
            this.socket.on('cardUpdate', callback);
        }
    }

    onCardFusion(callback) {
        if (this.socket) {
            this.socket.on('cardFusion', callback);
        }
    }

    onCardAdded(callback) {
        if (this.socket) {
            this.socket.on('cardAdded', callback);
        }
    }

    onGenerating(callback) {
        if (this.socket) {
            this.socket.on('generating', callback);
        }
    }

    onNewCardReady(callback) {
        if (this.socket) {
            this.socket.on('new-card-ready', callback);
        }
    }

    // Emit events
    emitCardFusion(fusionData) {
        if (this.socket && this.isConnected) {
            this.socket.emit('cardFusion', fusionData);
        }
    }

    emitCardAdded(cardData) {
        if (this.socket && this.isConnected) {
            this.socket.emit('cardAdded', cardData);
        }
    }

    emitJoinRoom(roomId) {
        if (this.socket && this.isConnected) {
            this.socket.emit('joinRoom', roomId);
        }
    }

    emitLeaveRoom(roomId) {
        if (this.socket && this.isConnected) {
            this.socket.emit('leaveRoom', roomId);
        }
    }

    emitRegisterFE() {
        if (this.socket && this.isConnected) {
            this.socket.emit('registerFE', {
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
            });
            console.log('Sent registerFE to backend');
        }
    }

    // Get socket instance
    getSocket() {
        return this.socket;
    }

    // Check connection status
    isSocketConnected() {
        return this.isConnected;
    }

    // Get detailed connection status for debugging
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            hasSocket: !!this.socket,
            socketId: this.socket?.id || null,
            socketConnected: this.socket?.connected || false,
            hasToken: !!this.getAccessToken(),
            url: URL
        };
    }

    // Debug method to log current status
    debugStatus() {
        const status = this.getConnectionStatus();
        console.log('[socket] 🔍 Debug Status:', status);
        return status;
    }

    // Reconnect with fresh token (useful after token refresh)
    reconnectWithFreshToken() {
        console.log('[socket] 🔄 Reconnecting with fresh token...');

        // Disconnect current socket
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
        }

        // Wait a bit before reconnecting
        setTimeout(() => {
            this.connect();
        }, 1000);
    }

    // Force reconnection (useful for debugging)
    forceReconnect() {
        console.log('[socket] 🔄 Force reconnecting...');
        this.disconnect();
        setTimeout(() => {
            this.connect();
        }, 500);
    }

    // Handle token refresh and reconnect
    async handleTokenRefresh() {
        console.log('[socket] 🔄 Handling token refresh...');
        try {
            // Use dynamic import to avoid circular dependency
            const { apiService } = await import('./api.js');
            const newToken = await apiService.refreshAccessToken();
            console.log('[socket] ✅ Token refreshed, reconnecting...');
            this.reconnectWithFreshToken();
            return newToken;
        } catch (error) {
            console.error('[socket] ❌ Token refresh failed:', error);
            this.clearTokensAndRedirect();
            throw error;
        }
    }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;