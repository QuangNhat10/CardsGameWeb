# Fusion Guide - Socket Integration

## Tổng quan
Trang Fusion Guide đã được tích hợp với backend API và Socket.IO để cung cấp trải nghiệm real-time cho việc quản lý và ghép card.

## Tính năng đã thêm

### 1. Socket Connection
- Kết nối real-time với backend server
- Hiển thị trạng thái kết nối (Connected/Disconnected)
- Tự động reconnect khi mất kết nối

### 2. API Integration
- Lấy danh sách card từ backend
- Tạo card mới qua API
- Thực hiện fusion card qua API
- Lưu trữ dữ liệu local làm fallback

### 3. Real-time Updates
- Nhận thông báo khi có card mới được tạo
- Nhận thông báo khi có fusion mới
- Cập nhật UI real-time

### 4. Card Library
- Hiển thị danh sách card có sẵn từ backend
- Filter theo rarity
- Click để thêm card vào workspace

## Cách sử dụng

### Kết nối Socket
```javascript
import socketService from '../services/socket';

// Kết nối
const socket = socketService.connect();

// Lắng nghe events
socketService.onCardUpdate((data) => {
  console.log('Card updated:', data);
});

// Emit events
socketService.emitCardFusion(fusionData);
```

### Sử dụng API
```javascript
import apiService from '../services/api';

// Lấy tất cả card
const cards = await apiService.getAllCards();

// Tạo card mới
const newCard = await apiService.createCard(cardData);

// Thực hiện fusion
const result = await apiService.performFusion(fusionData);
```

### Socket Events

#### Client → Server
- `cardAdded`: Thông báo card mới được tạo
- `cardFusion`: Thông báo fusion được thực hiện
- `joinRoom`: Tham gia room fusion-guide
- `leaveRoom`: Rời khỏi room

#### Server → Client
- `cardUpdate`: Cập nhật thông tin card
- `cardFusion`: Thông báo fusion mới
- `cardAdded`: Thông báo card mới được tạo

## Cấu trúc Files

```
src/
├── services/
│   ├── socket.js          # Socket service
│   └── api.js            # API service (đã cập nhật)
├── hooks/
│   └── useSocket.js      # Custom hook cho socket
├── components/
│   ├── CardLibrary.jsx   # Component hiển thị card library
│   └── CardLibrary.css   # Styles cho card library
└── pages/FusionGuide/
    ├── index.jsx         # Main component (đã cập nhật)
    └── styles.css        # Styles (đã cập nhật)
```

## Backend API Endpoints

### Cards
- `GET /api/cards` - Lấy tất cả card
- `GET /api/cards/:id` - Lấy card theo ID
- `POST /api/cards` - Tạo card mới
- `PUT /api/cards/:id` - Cập nhật card
- `DELETE /api/cards/:id` - Xóa card

### Fusion
- `POST /api/fusion` - Thực hiện fusion
- `GET /api/fusion/history` - Lịch sử fusion
- `GET /api/fusion/recipes` - Công thức fusion

### Users
- `GET /api/users/:id/cards` - Card của user
- `GET /api/users/:id/fusion-history` - Lịch sử fusion của user

## Error Handling

- Hiển thị lỗi khi không thể kết nối API
- Fallback về localStorage khi API không khả dụng
- Retry mechanism cho socket connection
- Loading states cho tất cả operations

## Performance

- Lazy loading cho card library
- Debounced API calls
- Efficient re-rendering với React hooks
- Optimized socket event handling

## Testing

Để test tính năng:

1. Mở trang Fusion Guide
2. Kiểm tra connection status (phải hiển thị "Connected to Server")
3. Click "Show Library" để xem card từ backend
4. Thử tạo card mới
5. Thử fusion 2 card
6. Kiểm tra real-time updates

## Troubleshooting

### Socket không kết nối được
- Kiểm tra backend server có chạy không
- Kiểm tra CORS settings
- Kiểm tra network connection

### API calls fail
- Kiểm tra backend endpoints
- Kiểm tra request format
- Kiểm tra authentication nếu có

### Real-time updates không hoạt động
- Kiểm tra socket connection
- Kiểm tra event names
- Kiểm tra room joining
