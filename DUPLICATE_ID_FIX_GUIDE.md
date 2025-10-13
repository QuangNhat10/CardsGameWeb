# Hướng Dẫn Sửa Lỗi Trùng ID

## Vấn Đề
Trong hệ thống card game, các "Placeholder Card" có thể bị trùng ID, dẫn đến hiển thị không chính xác trong sơ đồ gia phả.

## Nguyên Nhân
1. **Sử dụng `nodes.length + 1`**: Khi nhiều node được tạo cùng lúc, có thể tạo ra cùng một ID
2. **Sử dụng `index + 1`**: Index có thể bị reset hoặc trùng lặp
3. **Không kiểm tra duplicate**: Hệ thống không validate ID trước khi tạo node mới

## Giải Pháp Đã Triển Khai

### 1. Hàm Tạo ID Unique
```javascript
// Global ID counter để tránh trùng lặp
let globalIdCounter = 0;

// Function để tạo unique ID
const generateUniqueId = (prefix = 'card') => {
  globalIdCounter++;
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}_${timestamp}_${globalIdCounter}_${random}`;
};
```

### 2. Hàm Validate ID
```javascript
// Function để validate và đảm bảo ID unique
const ensureUniqueId = (proposedId, existingNodes) => {
  // Nếu ID đã tồn tại, tạo ID mới
  if (existingNodes.some(node => node.id === proposedId)) {
    return generateUniqueId();
  }
  return proposedId;
};
```

### 3. Hàm Sửa Duplicate IDs
```javascript
// Function để kiểm tra và sửa duplicate IDs
const fixDuplicateIds = (nodes) => {
  const seenIds = new Set();
  const duplicateIds = [];
  
  // Tìm duplicate IDs
  nodes.forEach(node => {
    if (seenIds.has(node.id)) {
      duplicateIds.push(node.id);
    } else {
      seenIds.add(node.id);
    }
  });
  
  if (duplicateIds.length > 0) {
    console.warn('🔧 Found duplicate IDs:', duplicateIds);
    
    // Sửa duplicate IDs
    const fixedNodes = nodes.map(node => {
      if (duplicateIds.includes(node.id)) {
        const newId = generateUniqueId('fixed');
        console.log(`🔧 Fixed duplicate ID: ${node.id} -> ${newId}`);
        return { ...node, id: newId };
      }
      return node;
    });
    
    return fixedNodes;
  }
  
  return nodes;
};
```

## Cách Sử Dụng

### 1. Tự Động Sửa Khi Load Dữ Liệu
- Khi load cards từ API, hệ thống tự động kiểm tra và sửa duplicate IDs
- Khi load từ localStorage, cũng tự động sửa duplicate IDs

### 2. Sử Dụng Debug Button
- Click vào button "🔧 Fix Duplicate IDs" trong debug tab
- Hệ thống sẽ kiểm tra và tự động sửa tất cả duplicate IDs
- Kết quả sẽ được log ra console

### 3. Kiểm Tra Console
```javascript
// Debug function để kiểm tra duplicate node IDs
const debugDuplicateNodes = () => {
  console.log('Current nodes:', nodes.map(n => `${n.id} (${n.data?.label || 'Unknown'})`));

  // Kiểm tra duplicate node IDs
  const nodeIds = nodes.map(n => n.id);
  const duplicateIds = nodeIds.filter((id, index) => nodeIds.indexOf(id) !== index);
  if (duplicateIds.length > 0) {
    console.warn('🔧 Duplicate node IDs found:', duplicateIds);
    
    // Tự động sửa duplicate IDs
    const fixedNodes = fixDuplicateIds(nodes);
    setNodes(fixedNodes);
    console.log('🔧 Auto-fixed duplicate node IDs');
  } else {
    console.log('✅ No duplicate node IDs found');
  }
};
```

## Các Thay Đổi Đã Thực Hiện

### 1. Cập Nhật Tạo Node Mới
```javascript
// Trước
const newId = (nodes.length + 1).toString();

// Sau
const newId = ensureUniqueId(generateUniqueId('ai_card'), nodes);
```

### 2. Cập Nhật Load Từ API
```javascript
// Trước
setNodes(apiNodes);

// Sau
const fixedNodes = fixDuplicateIds(apiNodes);
setNodes(fixedNodes);
```

### 3. Cập Nhật Load Từ LocalStorage
```javascript
// Trước
setNodes(parsedNodes);

// Sau
const fixedNodes = fixDuplicateIds(parsedNodes);
setNodes(fixedNodes);
```

## Lợi Ích

1. **Tự Động Sửa**: Hệ thống tự động phát hiện và sửa duplicate IDs
2. **Không Mất Dữ Liệu**: Chỉ thay đổi ID, giữ nguyên tất cả thông tin khác
3. **Debug Dễ Dàng**: Có button và console log để kiểm tra
4. **Tương Thích Ngược**: Không ảnh hưởng đến dữ liệu hiện có

## Kiểm Tra Kết Quả

1. Mở Developer Tools (F12)
2. Vào tab Console
3. Click button "🔧 Fix Duplicate IDs"
4. Kiểm tra log để xem có duplicate IDs nào được sửa không
5. Kiểm tra sơ đồ gia phả để đảm bảo không còn trùng lặp

## Lưu Ý

- Fix này chỉ áp dụng cho frontend
- Backend vẫn cần kiểm tra để tránh tạo duplicate IDs từ server
- Nên test kỹ trước khi deploy production




