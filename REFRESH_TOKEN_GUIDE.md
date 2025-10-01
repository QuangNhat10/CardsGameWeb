# Refresh Token Implementation Guide

## Tổng quan
Hệ thống đã được cập nhật để sử dụng refresh token mechanism, giúp tự động gia hạn access token khi hết hạn mà không cần user đăng nhập lại.

## Các thay đổi chính

### 1. API Service (`src/services/api.js`)
- **Token Management**: Quản lý cả `accessToken` và `refreshToken`
- **Auto Refresh**: Tự động refresh token khi gặp lỗi 401
- **Queue System**: Xử lý nhiều request đồng thời khi refresh token
- **Error Handling**: Xử lý lỗi token và redirect về login

### 2. Socket Service (`src/services/socket.js`)
- **Token Integration**: Sử dụng `accessToken` cho socket connection
- **Error Handling**: Xử lý lỗi token expiration
- **Fallback**: Kết nối không xác thực nếu không có token

### 3. Authentication Pages
- **Login**: Sử dụng `apiService.login()` thay vì fetch trực tiếp
- **Register**: Sử dụng `apiService.register()` với auto-login support
- **Token Storage**: Tự động lưu cả access và refresh token

## Cách hoạt động

### 1. Đăng nhập
```javascript
// User đăng nhập
const data = await apiService.login(credentials);
// Tokens được lưu tự động: accessToken + refreshToken
```

### 2. API Calls
```javascript
// Mọi API call đều tự động xử lý token
const cards = await apiService.getAllCards();
// Nếu token hết hạn, sẽ tự động refresh và retry
```

### 3. Socket Connection
```javascript
// Socket sử dụng accessToken
socketService.connect();
// Nếu token invalid, sẽ redirect về login
```

### 4. Token Refresh Flow
1. API call trả về 401 (Unauthorized)
2. Kiểm tra có refresh token không
3. Gọi `/auth/refresh` với refresh token
4. Lưu access token mới
5. Retry request gốc với token mới
6. Nếu refresh thất bại → redirect về login

## Các endpoint cần thiết

### Backend cần implement:
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout với refresh token

### Request/Response format:

#### Refresh Token Request:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Refresh Token Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Testing

### 1. Test Token Management
```javascript
import { testTokenManagement } from './src/utils/tokenTest.js';
testTokenManagement();
```

### 2. Test Scenarios
- ✅ Đăng nhập và lưu tokens
- ✅ API calls với valid token
- ✅ Socket connection với valid token
- ✅ Auto refresh khi token hết hạn
- ✅ Redirect về login khi refresh thất bại
- ✅ Multiple requests đồng thời khi refresh

## Troubleshooting

### Lỗi "Token không hợp lệ hoặc đã hết hạn"
- Kiểm tra backend có implement `/auth/refresh` endpoint
- Kiểm tra refresh token có hợp lệ không
- Kiểm tra network connection

### Socket connection failed
- Kiểm tra access token có được gửi đúng không
- Kiểm tra backend socket authentication
- Kiểm tra CORS settings

### API calls failed
- Kiểm tra backend có trả về đúng format response
- Kiểm tra error handling trong fetchData
- Kiểm tra console logs để debug

## Security Notes

1. **Token Storage**: Tokens được lưu trong localStorage (có thể nâng cấp lên httpOnly cookies)
2. **Token Rotation**: Refresh token được rotate mỗi lần refresh
3. **Error Handling**: Không log token thật ra console
4. **Auto Logout**: Tự động logout khi refresh thất bại

## Migration Notes

- Tất cả API calls đã được migrate sang sử dụng `apiService`
- Socket connection đã được cập nhật để sử dụng `accessToken`
- Authentication pages đã được cập nhật
- Backward compatibility được duy trì
