# Socket Events Guide - Fusion Guide Integration

## Tổng quan
Hướng dẫn sử dụng các socket events mới đã được thêm vào Fusion Guide để kết nối với backend.

## Socket Events

### 1. Frontend → Backend

#### `registerFE`
**Mục đích**: Thông báo cho backend rằng frontend đã kết nối thành công

**Khi nào gửi**: Tự động gửi khi socket kết nối thành công

**Data gửi**:
```javascript
{
  timestamp: "2024-01-15T10:30:00.000Z",
  userAgent: "Mozilla/5.0...",
  url: "http://localhost:3000/fusion-guide"
}
```

**Cách sử dụng**:
```javascript
// Tự động gửi khi kết nối
socketService.connect(); // Sẽ tự động emit registerFE
```

### 2. Backend → Frontend

#### `generating`
**Mục đích**: Gửi tiến trình tạo ảnh từ backend

**Data nhận**:
```javascript
{
  "requestId": "req_123456789",
  "progress": 75,
  "timeLeft": 15
}
```

**Cách lắng nghe**:
```javascript
socketService.onGenerating((data) => {
  console.log('Generating progress:', data);
  // data.requestId - ID của request
  // data.progress - Tiến trình (0-100)
  // data.timeLeft - Thời gian còn lại (giây)
});
```

## Implementation Details

### 1. Socket Service Updates

#### Thêm method `emitRegisterFE()`
```javascript
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
```

#### Thêm method `onGenerating()`
```javascript
onGenerating(callback) {
  if (this.socket) {
    this.socket.on('generating', callback);
  }
}
```

### 2. Fusion Guide Integration

#### State Management
```javascript
const [generatingProgress, setGeneratingProgress] = useState(null);
```

#### Event Listener
```javascript
socketService.onGenerating((data) => {
  console.log('Generating progress received:', data);
  setGeneratingProgress(data);
  
  // Auto-hide when complete
  if (data.progress >= 100) {
    setTimeout(() => {
      setGeneratingProgress(null);
    }, 2000);
  }
});
```

### 3. UI Components

#### GeneratingProgress Component
- Modal hiển thị tiến trình tạo ảnh
- Progress bar với animation
- Hiển thị request ID và time left
- Auto-hide khi hoàn thành

#### Features:
- **Progress Bar**: Hiển thị tiến trình 0-100%
- **Time Left**: Đếm ngược thời gian còn lại
- **Request ID**: Hiển thị ID của request
- **Animations**: Spinning icon, glowing progress bar
- **Auto-hide**: Tự động ẩn sau 2 giây khi hoàn thành

## Backend Integration

### 1. Lắng nghe `registerFE`
```javascript
socket.on('registerFE', (data) => {
  console.log('Frontend registered:', data);
  // Lưu thông tin frontend connection
  // Có thể lưu vào database hoặc memory
});
```

### 2. Gửi `generating` events
```javascript
// Khi bắt đầu tạo ảnh
socket.emit('generating', {
  requestId: 'req_123456789',
  progress: 0,
  timeLeft: 60
});

// Cập nhật tiến trình
socket.emit('generating', {
  requestId: 'req_123456789',
  progress: 50,
  timeLeft: 30
});

// Hoàn thành
socket.emit('generating', {
  requestId: 'req_123456789',
  progress: 100,
  timeLeft: 0
});
```

## Testing

### 1. Test Socket Connection
```javascript
// Kiểm tra console logs
// Sẽ thấy: "Connected to server: [socket_id]"
// Sẽ thấy: "Sent registerFE to backend"
```

### 2. Test Generating Progress
- Click button "Test Progress" trong Fusion Guide
- Sẽ thấy modal progress với animation
- Progress sẽ tăng từ 0% đến 100%
- Modal sẽ tự động ẩn sau khi hoàn thành

### 3. Test Real Backend
```javascript
// Backend cần gửi events như sau:
socket.emit('generating', {
  requestId: 'unique_request_id',
  progress: 25,
  timeLeft: 45
});
```

## Error Handling

### 1. Socket Connection Errors
- Tự động retry connection
- Hiển thị connection status
- Fallback to mock data

### 2. Generating Progress Errors
- Handle invalid progress values
- Handle missing requestId
- Handle network disconnection

### 3. UI Error States
- Loading states
- Error messages
- Connection indicators

## Best Practices

### 1. Backend
- Gửi `generating` events thường xuyên (mỗi 1-2 giây)
- Đảm bảo `progress` luôn trong khoảng 0-100
- Gửi `progress: 100` khi hoàn thành
- Sử dụng unique `requestId` cho mỗi request

### 2. Frontend
- Lắng nghe `generating` events
- Update UI real-time
- Handle edge cases (progress > 100, negative timeLeft)
- Auto-hide progress khi hoàn thành

### 3. Performance
- Debounce progress updates nếu cần
- Clean up event listeners
- Optimize animations
- Handle multiple concurrent requests

## Troubleshooting

### 1. registerFE không được gửi
- Kiểm tra socket connection
- Kiểm tra console logs
- Verify backend đang lắng nghe event

### 2. generating events không hiển thị
- Kiểm tra backend có gửi events không
- Kiểm tra event name chính xác
- Verify data format

### 3. Progress không cập nhật
- Kiểm tra state management
- Verify callback functions
- Check for JavaScript errors

## Future Enhancements

### 1. Multiple Requests
- Handle multiple concurrent generating requests
- Queue management
- Request cancellation

### 2. Enhanced UI
- Different progress types
- Custom animations
- Sound notifications

### 3. Analytics
- Track generation times
- Success/failure rates
- User interaction metrics
