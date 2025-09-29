import { io } from 'socket.io-client';
import { URL } from './api.js';

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
    }

    connect() {
        if (this.socket && this.isConnected) {
            return this.socket;
        }

        this.socket = io(URL, {
            transports: ['websocket', 'polling'],
            timeout: 20000,
            forceNew: true
        });

        this.socket.on('connect', () => {
            console.log('Connected to server:', this.socket.id);
            this.isConnected = true;

            // Gửi registerFE để thông báo frontend đã kết nối
            this.emitRegisterFE();
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.isConnected = false;
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
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
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;