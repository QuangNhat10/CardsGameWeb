// API Test Helper - Kiểm tra endpoint API
export const testAPIEndpoint = async (url, method = 'GET', body = null) => {
    try {
        console.log(`🔍 Testing API endpoint: ${url}`);

        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        };

        if (body && method !== 'GET') {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);

        console.log(`📊 Response Status: ${response.status}`);
        console.log(`📋 Response Headers:`, Object.fromEntries(response.headers.entries()));

        const contentType = response.headers.get("content-type");
        console.log(`📄 Content-Type: ${contentType}`);

        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            console.log(`✅ JSON Response:`, data);
            return { success: true, data, status: response.status };
        } else {
            const text = await response.text();
            console.log(`❌ Non-JSON Response (first 200 chars):`, text.substring(0, 200));
            return {
                success: false,
                error: "Server returned HTML instead of JSON",
                text: text.substring(0, 200),
                status: response.status
            };
        }
    } catch (error) {
        console.error(`💥 API Test Error:`, error);
        return { success: false, error: error.message };
    }
};

// Test các endpoint có thể có
export const testAuthEndpoints = async () => {
    const baseUrl = "https://gamethebaiteam3-backend.onrender.com";

    console.log("🚀 Testing Auth Endpoints...");

    // Test các endpoint có thể có
    const endpoints = [
        "/api/auth/register",
        "/api/auth/login",
        "/auth/register",
        "/auth/login",
        "/register",
        "/login",
        "/api/users/register",
        "/api/users/login"
    ];

    for (const endpoint of endpoints) {
        console.log(`\n--- Testing: ${endpoint} ---`);
        await testAPIEndpoint(baseUrl + endpoint, 'POST', {
            email: 'test@example.com',
            password: 'test123'
        });
    }

    // Test root endpoint
    console.log(`\n--- Testing Root Endpoint ---`);
    await testAPIEndpoint(baseUrl);
};

// Test endpoint cụ thể
export const testSpecificEndpoint = async (endpoint, method = 'POST', body = null) => {
    const baseUrl = "https://gamethebaiteam3-backend.onrender.com";
    return await testAPIEndpoint(baseUrl + endpoint, method, body);
};



