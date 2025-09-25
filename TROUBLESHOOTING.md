# Troubleshooting Guide - Fusion Guide API Integration

## Vấn đề đã gặp phải

### Lỗi 404 - API Endpoint không tồn tại
```
GET https://gamethebaiteam3-backend.onrender.com/api/cards 404 (Not Found)
```

## Giải pháp đã áp dụng

### 1. Cập nhật API Endpoints
- **Trước**: `/api/cards` 
- **Sau**: `/cards` (theo API documentation)
- **Lý do**: Backend có thể sử dụng cấu trúc endpoint khác

### 2. Thêm Mock Data Fallback
```javascript
// Mock data được sử dụng khi API không khả dụng
export const MOCK_CARDS = [
  {
    id: '1',
    name: 'Fire Dragon',
    power: 95,
    rarity: 'Legendary',
    // ... other properties
  }
  // ... more cards
];
```

### 3. Error Handling với Fallback
```javascript
async getAllCards() {
  try {
    return await this.fetchData(API_ENDPOINTS.CARDS);
  } catch (error) {
    console.warn('API not available, using mock data:', error.message);
    return MOCK_CARDS; // Fallback to mock data
  }
}
```

### 4. UI Indicators
- **Connection Status**: Hiển thị trạng thái kết nối socket
- **Mock Data Warning**: Cảnh báo khi đang sử dụng demo data
- **Loading States**: Hiển thị trạng thái loading
- **Error Messages**: Hiển thị lỗi một cách rõ ràng

## Cách kiểm tra và debug

### 1. Kiểm tra API Endpoints
```bash
# Test root endpoint
curl https://gamethebaiteam3-backend.onrender.com/

# Test cards endpoint (nếu có)
curl https://gamethebaiteam3-backend.onrender.com/cards
```

### 2. Kiểm tra Console Logs
- Mở Developer Tools (F12)
- Xem tab Console để kiểm tra:
  - API calls
  - Socket connection status
  - Error messages
  - Mock data usage warnings

### 3. Kiểm tra Network Tab
- Xem tab Network trong Developer Tools
- Kiểm tra các API requests:
  - Status codes (200, 404, 500, etc.)
  - Request/Response headers
  - Response data

## Các trường hợp có thể xảy ra

### 1. API hoàn toàn không khả dụng
- **Hiện tượng**: Tất cả API calls trả về 404/500
- **Giải pháp**: Sử dụng mock data (đã implement)
- **UI**: Hiển thị warning "Using demo data"

### 2. API có endpoint khác
- **Hiện tượng**: 404 cho `/cards` nhưng có thể có `/api/cards` hoặc `/v1/cards`
- **Giải pháp**: Cập nhật `API_ENDPOINTS` trong `api.js`
- **Cần kiểm tra**: API documentation hoặc liên hệ backend team

### 3. CORS Issues
- **Hiện tượng**: CORS errors trong console
- **Giải pháp**: Backend cần cấu hình CORS cho frontend domain
- **Temporary fix**: Sử dụng mock data

### 4. Socket Connection Issues
- **Hiện tượng**: Socket không kết nối được
- **Giải pháp**: Kiểm tra socket server và CORS settings
- **Fallback**: App vẫn hoạt động với mock data

## Cách cập nhật khi API sẵn sàng

### 1. Cập nhật API Endpoints
```javascript
// Trong src/services/api.js
export const API_ENDPOINTS = {
  CARDS: '/api/cards',  // Hoặc endpoint chính xác
  FUSION: '/api/fusion',
  // ...
};
```

### 2. Test API Calls
```javascript
// Test từng endpoint
const testAPI = async () => {
  try {
    const cards = await apiService.getAllCards();
    console.log('API working:', cards);
  } catch (error) {
    console.error('API still not working:', error);
  }
};
```

### 3. Remove Mock Data Warnings
- Khi API hoạt động ổn định, có thể remove mock data warnings
- Hoặc giữ lại để debug trong tương lai

## Monitoring và Logging

### 1. Console Logs
- API calls success/failure
- Socket connection status
- Mock data usage
- Error details

### 2. User Feedback
- Connection status indicator
- Loading states
- Error messages
- Mock data warnings

### 3. Performance Monitoring
- API response times
- Socket connection stability
- Error rates

## Liên hệ và Support

### 1. Backend Team
- Kiểm tra API documentation
- Xác nhận endpoints chính xác
- Cấu hình CORS nếu cần

### 2. Frontend Team
- Monitor console logs
- Test với mock data
- Update endpoints khi cần

### 3. Testing
- Test offline mode (mock data)
- Test với API available
- Test socket connections
- Test error scenarios

## Best Practices

### 1. Graceful Degradation
- App hoạt động ngay cả khi API không khả dụng
- Clear feedback cho user
- Fallback mechanisms

### 2. Error Handling
- Catch và handle tất cả API errors
- Provide meaningful error messages
- Log errors for debugging

### 3. User Experience
- Loading indicators
- Connection status
- Clear error messages
- Mock data warnings

### 4. Development
- Use mock data for development
- Test error scenarios
- Monitor API availability
- Keep fallback mechanisms
