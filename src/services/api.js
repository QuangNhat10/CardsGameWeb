// Robust API base URL selection to avoid localhost in production
const envApiUrl = (import.meta?.env?.VITE_API_URL);
const isBrowser = typeof window !== 'undefined';
const isLocalHost = isBrowser && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '0.0.0.0'
);
// If running locally, allow localhost env value; otherwise, force a non-localhost URL
export const URL = (() => {
    if (isLocalHost) {
        return envApiUrl || 'http://localhost:5000';
    }
    // In production: prefer env var if it is NOT pointing to localhost; else fallback to Render URL
    if (envApiUrl && !/localhost|127\.0\.0\.1|0\.0\.0\.0/i.test(envApiUrl)) {
        return envApiUrl;
    }
    return 'https://gamethebaiteam3-backend.onrender.com';
})();
try { console.log('[api] Base URL =', URL); } catch {}

// API endpoints - use real backend paths
export const API_ENDPOINTS = {
    CARDS: '/cards',
    FUSION: '/fusion',
    USERS: '/users',
    AUTH: '/auth'
};

// API service class with refresh token support
class ApiService {
    constructor() {
        this.baseURL = URL;
        this.isRefreshing = false;
        this.failedQueue = [];
    }

    // Token management
    getAccessToken() {
        try {
            return localStorage.getItem('accessToken');
        } catch (error) {
            console.warn('Failed to get access token from localStorage:', error);
            return null;
        }
    }

    getRefreshToken() {
        try {
            return localStorage.getItem('refreshToken');
        } catch (error) {
            console.warn('Failed to get refresh token from localStorage:', error);
            return null;
        }
    }

    setTokens(accessToken, refreshToken) {
        try {
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            console.log('Tokens saved successfully');
        } catch (error) {
            console.error('Failed to save tokens:', error);
        }
    }

    clearTokens() {
        try {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            console.log('Tokens cleared');
        } catch (error) {
            console.error('Failed to clear tokens:', error);
        }
    }

    // Clear tokens and redirect to login
    clearTokensAndRedirect() {
        this.clearTokens();
        window.location.href = '/login';
    }

    // Refresh access token using refresh token
    async refreshAccessToken() {
        if (this.isRefreshing) {
            // If already refreshing, wait for it to complete
            return new Promise((resolve, reject) => {
                this.failedQueue.push({ resolve, reject });
            });
        }

        this.isRefreshing = true;
        const refreshToken = this.getRefreshToken();

        if (!refreshToken) {
            this.clearTokensAndRedirect();
            return Promise.reject(new Error('No refresh token available'));
        }

        try {
            console.log('Refreshing access token...');
            const response = await fetch(`${this.baseURL}${API_ENDPOINTS.AUTH}/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken })
            });

            if (!response.ok) {
                throw new Error(`Refresh failed: ${response.status}`);
            }

            const data = await response.json();

            // Save new tokens
            this.setTokens(data.accessToken, data.refreshToken);

            console.log('Access token refreshed successfully');

            // Process failed queue
            this.processQueue(null, data.accessToken);

            return data.accessToken;
        } catch (error) {
            console.error('Failed to refresh access token:', error);
            this.processQueue(error, null);
            this.clearTokensAndRedirect();
            throw error;
        } finally {
            this.isRefreshing = false;
        }
    }

    // Process failed requests queue
    processQueue(error, token = null) {
        this.failedQueue.forEach(({ resolve, reject }) => {
            if (error) {
                reject(error);
            } else {
                resolve(token);
            }
        });

        this.failedQueue = [];
    }

    // Generic fetch method with automatic token refresh
    async fetchData(endpoint, options = {}) {
        const makeRequest = async (accessToken) => {
            const headers = {
                'Content-Type': 'application/json',
                ...options.headers
            };

            // Add authorization header if token exists
            if (accessToken) {
                headers['Authorization'] = accessToken.startsWith('Bearer ') ? accessToken : `Bearer ${accessToken}`;
            }

            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers
            });

            // Handle token expiration
            if (response.status === 401) {
                const refreshToken = this.getRefreshToken();

                if (refreshToken && !this.isRefreshing) {
                    console.log('Access token expired, attempting refresh...');

                    try {
                        const newAccessToken = await this.refreshAccessToken();

                        // Retry the original request with new token
                        headers['Authorization'] = newAccessToken.startsWith('Bearer ') ? newAccessToken : `Bearer ${newAccessToken}`;

                        const retryResponse = await fetch(`${this.baseURL}${endpoint}`, {
                            ...options,
                            headers
                        });

                        if (!retryResponse.ok) {
                            throw new Error(`HTTP error! status: ${retryResponse.status}`);
                        }

                        return await retryResponse.json();
                    } catch (refreshError) {
                        console.error('Token refresh failed:', refreshError);
                        this.clearTokensAndRedirect();
                        throw new Error('Token refresh failed');
                    }
                } else {
                    console.warn('No refresh token available, redirecting to login');
                    this.clearTokensAndRedirect();
                    throw new Error('Token expired and no refresh token available');
                }
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        };

        try {
            const accessToken = this.getAccessToken();
            return await makeRequest(accessToken);
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Authentication methods
    async login(credentials) {
        try {
            const response = await fetch(`${this.baseURL}${API_ENDPOINTS.AUTH}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials)
            });

            if (!response.ok) {
                throw new Error(`Login failed: ${response.status}`);
            }

            const data = await response.json();

            // Save both tokens
            this.setTokens(data.accessToken, data.refreshToken);

            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async register(userData) {
        try {
            const response = await fetch(`${this.baseURL}${API_ENDPOINTS.AUTH}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                throw new Error(`Registration failed: ${response.status}`);
            }

            const data = await response.json();

            // Save both tokens if registration includes auto-login
            if (data.accessToken && data.refreshToken) {
                this.setTokens(data.accessToken, data.refreshToken);
            }

            return data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    async logout() {
        try {
            const refreshToken = this.getRefreshToken();

            if (refreshToken) {
                await fetch(`${this.baseURL}${API_ENDPOINTS.AUTH}/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ refreshToken })
                });
            }
        } catch (error) {
            console.warn('Logout request failed:', error);
        } finally {
            this.clearTokens();
        }
    }

    // Card-related API calls
    async getAllCards() {
        return this.fetchData(API_ENDPOINTS.CARDS);
    }

    async getCardById(id) {
        return this.fetchData(`${API_ENDPOINTS.CARDS}/${id}`);
    }

    async createCard(cardData) {
        return this.fetchData(API_ENDPOINTS.CARDS, {
            method: 'POST',
            body: JSON.stringify(cardData)
        });
    }

    async updateCard(id, cardData) {
        return this.fetchData(`${API_ENDPOINTS.CARDS}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(cardData)
        });
    }

    async deleteCard(id) {
        return this.fetchData(`${API_ENDPOINTS.CARDS}/${id}`, {
            method: 'DELETE'
        });
    }

    // Fusion-related API calls
    async mergeCards(mergeData) {
        return this.fetchData('/cards/merge', {
            method: 'POST',
            body: JSON.stringify(mergeData)
        });
    }

    async performFusion(fusionData) {
        const candidatePaths = [
            API_ENDPOINTS.FUSION,
            '/cards/fusion',
            '/fusion/create',
            '/ai/fusion',
            '/cards/fuse',
            '/cards/merge',
            '/fusions',
            '/api/fusion',
            '/api/cards/fusion',
            '/api/cards/fuse'
        ];

        let lastError;
        for (const path of candidatePaths) {
            try {
                return await this.fetchData(path, {
                    method: 'POST',
                    body: JSON.stringify(fusionData)
                });
            } catch (err) {
                lastError = err;
            }
        }
        throw lastError || new Error('Fusion endpoint not found');
    }

    async getFusionHistory() {
        const candidatePaths = [
            `${API_ENDPOINTS.FUSION}/history`,
            '/api/fusion/history',
            '/fusions/history',
            '/cards/fusion/history'
        ];
        let lastError;
        for (const path of candidatePaths) {
            try {
                return await this.fetchData(path);
            } catch (err) {
                lastError = err;
            }
        }
        console.warn('Fusion history endpoints not found, returning empty list');
        return [];
    }

    async getFusionRecipes() {
        const candidatePaths = [
            `${API_ENDPOINTS.FUSION}/recipes`,
            '/api/fusion/recipes',
            '/cards/recipes',
            '/api/cards/recipes'
        ];
        let lastError;
        for (const path of candidatePaths) {
            try {
                return await this.fetchData(path);
            } catch (err) {
                lastError = err;
            }
        }
        console.warn('Fusion recipes endpoints not found, returning empty list');
        return [];
    }

    // User-related API calls
    async getUserCards(userId) {
        return this.fetchData(`${API_ENDPOINTS.USERS}/${userId}/cards`);
    }

    async getUserFusionHistory(userId) {
        return this.fetchData(`${API_ENDPOINTS.USERS}/${userId}/fusion-history`);
    }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;