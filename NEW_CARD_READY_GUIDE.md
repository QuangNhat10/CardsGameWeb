# New Card Ready Event Guide

## Tổng quan
Event `new-card-ready` được gửi từ backend khi AI hoàn thành việc tạo ảnh card mới.

## Event Details

### **Event Name**: `new-card-ready`

### **Data Format**:
```javascript
{
  cardId: "card_123456789",        // ID của card mới được tạo
  img: "https://example.com/image.jpg",  // Link ảnh đã được tạo
  parentIds: ["card_1", "card_2"]  // ID của 2 card dùng để tạo
}
```

## Frontend Implementation

### **1. Socket Service**
```javascript
// Lắng nghe event new-card-ready
onNewCardReady(callback) {
  if (this.socket) {
    this.socket.on('new-card-ready', callback);
  }
}
```

### **2. Fusion Guide Integration**
```javascript
// Lắng nghe new-card-ready event
socketService.onNewCardReady((data) => {
  console.log('New card ready received:', data);
  
  // Thêm card mới vào workspace
  const newId = data.cardId;
  const newX = 200 + Math.random() * 400;
  const newY = 200 + Math.random() * 300;

  setNodes(prevNodes => [
    ...prevNodes,
    {
      id: newId,
      type: "cardNode",
      position: { x: newX, y: newY },
      data: {
        label: `AI Card ${newId}`,
        img: data.img,  // Ảnh thật từ AI
        description: `AI generated card from fusion`,
        power: Math.floor(Math.random() * 100),
        rarity: "AI Generated",
        parentIds: data.parentIds,
      },
    },
  ]);

  // Tạo edges từ parent cards
  if (data.parentIds && data.parentIds.length >= 2) {
    setEdges(prevEdges => [
      ...prevEdges,
      {
        id: `e${data.parentIds[0]}-${newId}`,
        source: data.parentIds[0],
        target: newId,
        type: "step",
        style: { stroke: "#4caf50", strokeWidth: 3 },
      },
      {
        id: `e${data.parentIds[1]}-${newId}`,
        source: data.parentIds[1],
        target: newId,
        type: "step",
        style: { stroke: "#4caf50", strokeWidth: 3 },
      },
    ]);
  }
});
```

## Backend Implementation

### **Gửi event khi AI tạo ảnh xong**:
```javascript
// Khi AI hoàn thành tạo ảnh
socket.emit('new-card-ready', {
  cardId: card._id,
  img: imageUrl,  // Link ảnh đã được tạo
  parentIds: [parentCard1Id, parentCard2Id]
});
```

## UI Features

### **1. Notification**
- Hiển thị thông báo "🎉 New AI card ready!"
- Hiển thị Card ID
- Tự động ẩn sau 5 giây

### **2. Card Addition**
- Tự động thêm card mới vào workspace
- Sử dụng ảnh thật từ AI
- Đánh dấu là "AI Generated"

### **3. Connection Lines**
- Tạo đường kết nối từ parent cards
- Màu xanh lá để phân biệt với fusion thường
- Hiển thị mối quan hệ parent-child

## Flow Complete

### **1. User thực hiện fusion**
- Chọn 2 cards
- Click "Ghép Card"
- Gửi request đến backend

### **2. Backend xử lý**
- Nhận fusion request
- Gửi `generating` events với progress
- Gọi AI tạo ảnh
- Lưu card mới vào database

### **3. AI hoàn thành**
- Backend gửi `new-card-ready` event
- Frontend nhận và hiển thị card mới
- User thấy kết quả cuối cùng

## Testing

### **1. Test với mock data**
```javascript
// Simulate new-card-ready event
socketService.onNewCardReady({
  cardId: 'test-card-123',
  img: 'https://example.com/test-image.jpg',
  parentIds: ['card1', 'card2']
});
```

### **2. Test với real backend**
- Thực hiện fusion thật
- Chờ AI tạo ảnh
- Kiểm tra card mới xuất hiện

## Error Handling

### **1. Missing data**
- Kiểm tra `cardId` có tồn tại
- Kiểm tra `img` URL có hợp lệ
- Fallback cho `parentIds`

### **2. Network issues**
- Retry mechanism
- Offline handling
- User feedback

## Best Practices

### **1. Backend**
- Gửi event ngay khi AI hoàn thành
- Đảm bảo `img` URL accessible
- Validate `parentIds` trước khi gửi

### **2. Frontend**
- Handle missing data gracefully
- Show loading states
- Provide user feedback
- Clean up old notifications

### **3. Performance**
- Debounce rapid events
- Optimize image loading
- Efficient DOM updates

## Troubleshooting

### **1. Card không xuất hiện**
- Kiểm tra console logs
- Verify event data format
- Check image URL accessibility

### **2. Parent connections không hiển thị**
- Verify `parentIds` format
- Check parent cards exist
- Validate edge creation

### **3. Notification không hiển thị**
- Check CSS animations
- Verify state updates
- Test with mock data
