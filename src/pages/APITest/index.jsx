import React, { useState } from 'react';
import { testAuthEndpoints, testSpecificEndpoint } from '../../utils/apiTest';

export default function APITest() {
    const [isTesting, setIsTesting] = useState(false);
    const [results, setResults] = useState([]);

    const handleTestAllEndpoints = async () => {
        setIsTesting(true);
        setResults([]);

        console.clear();
        console.log("🧪 Starting API Endpoint Tests...");

        try {
            await testAuthEndpoints();
            setResults(prev => [...prev, "✅ All endpoint tests completed. Check console for details."]);
        } catch (error) {
            console.error("Test failed:", error);
            setResults(prev => [...prev, `❌ Test failed: ${error.message}`]);
        } finally {
            setIsTesting(false);
        }
    };

    const handleTestSpecificEndpoint = async () => {
        setIsTesting(true);

        const endpoint = "/api/auth/register";
        console.log(`🔍 Testing specific endpoint: ${endpoint}`);

        try {
            const result = await testSpecificEndpoint(endpoint, 'POST', {
                email: 'test@example.com',
                password: 'test123'
            });

            if (result.success) {
                setResults(prev => [...prev, `✅ ${endpoint} - Status: ${result.status}`]);
            } else {
                setResults(prev => [...prev, `❌ ${endpoint} - ${result.error}`]);
            }
        } catch (error) {
            setResults(prev => [...prev, `❌ ${endpoint} - Error: ${error.message}`]);
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1>🧪 API Endpoint Tester</h1>

            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={handleTestAllEndpoints}
                    disabled={isTesting}
                    style={{
                        padding: '10px 20px',
                        marginRight: '10px',
                        backgroundColor: isTesting ? '#ccc' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: isTesting ? 'not-allowed' : 'pointer'
                    }}
                >
                    {isTesting ? 'Testing...' : 'Test All Auth Endpoints'}
                </button>

                <button
                    onClick={handleTestSpecificEndpoint}
                    disabled={isTesting}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: isTesting ? '#ccc' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: isTesting ? 'not-allowed' : 'pointer'
                    }}
                >
                    Test Register Endpoint
                </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h3>📋 Instructions:</h3>
                <ol>
                    <li>Click "Test All Auth Endpoints" to check all possible endpoints</li>
                    <li>Open browser Developer Tools (F12) and go to Console tab</li>
                    <li>Check the console output for detailed response information</li>
                    <li>Look for successful endpoints that return JSON data</li>
                </ol>
            </div>

            {results.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                    <h3>📊 Test Results:</h3>
                    <div style={{
                        backgroundColor: '#f8f9fa',
                        padding: '15px',
                        borderRadius: '5px',
                        border: '1px solid #dee2e6'
                    }}>
                        {results.map((result, index) => (
                            <div key={index} style={{ marginBottom: '5px' }}>
                                {result}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '5px' }}>
                <h4>🔍 Debugging Tips:</h4>
                <ul>
                    <li><strong>404 Error:</strong> Endpoint doesn't exist - try different paths</li>
                    <li><strong>HTML Response:</strong> Server returns webpage instead of API - wrong endpoint</li>
                    <li><strong>CORS Error:</strong> Server blocks requests from your domain</li>
                    <li><strong>500 Error:</strong> Server has internal error - contact backend team</li>
                </ul>
            </div>

            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#d1ecf1', borderRadius: '5px' }}>
                <h4>💡 Possible Endpoint Paths:</h4>
                <ul>
                    <li><code>/api/auth/register</code> - Most common</li>
                    <li><code>/auth/register</code> - Without /api prefix</li>
                    <li><code>/register</code> - Direct endpoint</li>
                    <li><code>/api/users/register</code> - Alternative structure</li>
                </ul>
            </div>
        </div>
    );
}


