export const URL = "https://gamethebaiteam3-backend.onrender.com";

// API endpoints - use real backend paths
export const API_ENDPOINTS = {
    CARDS: '/cards',
    FUSION: '/fusion',
    USERS: '/users',
    AUTH: '/auth'
};

// API service class
class ApiService {
    constructor() {
        this.baseURL = URL;
    }

    // Generic fetch method
    async fetchData(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Card-related API calls
    async getAllCards() {
        // Load only from real API; let caller handle errors
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
        // Swagger: POST /cards/merge
        return this.fetchData('/cards/merge', {
            method: 'POST',
            body: JSON.stringify(mergeData)
        });
    }

    async performFusion(fusionData) {
        // Try multiple likely endpoints to be compatible with BE routing
        const candidatePaths = [
            API_ENDPOINTS.FUSION,
            '/cards/fusion',
            '/fusion/create',
            '/ai/fusion',
            // Swagger alternatives
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
        // Graceful fallback
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
        // Graceful fallback
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