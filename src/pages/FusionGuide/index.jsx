import React, { useState, useCallback, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import "./styles.css"; // CSS tách riêng
import Header from "../../components/Header"; // hoặc Navbar của bạn
import CardLibrary from "../../components/CardLibrary";
import socketService from "../../services/socket";
import apiService from "../../services/api";

const fallbackImg = "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg";
const cardImg = ""; // Prefer real image urls from API; use fallback when rendering

const initialNodes = [];

const initialEdges = [];

const STORAGE_KEYS = {
  nodes: "fusionGuide:nodes",
  edges: "fusionGuide:edges",
  fusedCards: "fusionGuide:fusedCards",
};

// Global ID counter để tránh trùng lặp
let globalIdCounter = 0;

// Function để tạo unique ID
const generateUniqueId = (prefix = 'card') => {
  globalIdCounter++;
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}_${timestamp}_${globalIdCounter}_${random}`;
};

// Function để validate và đảm bảo ID unique
const ensureUniqueId = (proposedId, existingNodes) => {
  // Nếu ID đã tồn tại, tạo ID mới
  if (existingNodes.some(node => node.id === proposedId)) {
    return generateUniqueId();
  }
  return proposedId;
};

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

function CardNode({ data, selected }) {
  const [hovered, setHovered] = useState(false);
  const imgSrc = data.img && typeof data.img === 'string' && data.img.trim().length > 0 ? data.img : fallbackImg;

  // Xác định style dựa trên loại thẻ
  const getCardStyle = () => {
    if (data.isRecipe) {
      return {
        background: selected ? "#ffe082" : "#9c27b0",
        border: selected ? "3px solid #ffb300" : "3px solid #7b1fa2",
        boxShadow: "0 4px 12px rgba(156, 39, 176, 0.4)",
        borderRadius: "50%",
        width: 60,
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "24px",
        fontWeight: "bold"
      };
    } else if (data.isRoot) {
      return {
        background: selected ? "#ffe082" : "#4caf50",
        border: selected ? "3px solid #ffb300" : "3px solid #2e7d32",
        boxShadow: "0 4px 12px rgba(76, 175, 80, 0.4)"
      };
    } else if (data.isParent) {
      return {
        background: selected ? "#ffe082" : "#2196f3",
        border: selected ? "3px solid #ffb300" : "2px solid #1976d2",
        boxShadow: "0 2px 8px rgba(33, 150, 243, 0.3)"
      };
    } else if (data.isChild) {
      return {
        background: selected ? "#ffe082" : "#ff9800",
        border: selected ? "3px solid #ffb300" : "2px solid #f57c00",
        boxShadow: "0 2px 8px rgba(255, 152, 0, 0.3)"
      };
    } else {
      return {
        background: selected ? "#ffe082" : "#222",
        border: selected ? "3px solid #ffb300" : "2px solid #444",
        boxShadow: "0 2px 8px #0008"
      };
    }
  };

  // Render đặc biệt cho node công thức
  if (data.isRecipe) {
    return (
      <div
        style={{
          ...getCardStyle(),
          cursor: "default",
          position: "relative",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Handle
          type="target"
          position={Position.Top}
          style={{
            background: "#fff",
            width: 8,
            height: 8,
            borderRadius: "50%",
            top: -4,
            left: 26,
            border: "2px solid #7b1fa2",
          }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          style={{
            background: "#fff",
            width: 8,
            height: 8,
            borderRadius: "50%",
            bottom: -4,
            left: 26,
            border: "2px solid #7b1fa2",
          }}
        />
        <div style={{ fontSize: "24px", fontWeight: "bold" }}>+</div>
        {hovered && (
          <div className="card-tooltip-fadein">
            <div>
              <strong>Công thức ghép</strong>
            </div>
            <div>
              <strong>Mô tả:</strong> {data.description}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        width: 80,
        height: 120,
        ...getCardStyle(),
        borderRadius: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: "bold",
        cursor: "pointer",
        position: "relative",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: "#fff",
          width: 10,
          height: 10,
          borderRadius: "50%",
          top: -5,
          left: 35,
          border: "2px solid #3949ab",
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: "#fff",
          width: 10,
          height: 10,
          borderRadius: "50%",
          bottom: -5,
          left: 35,
          border: "2px solid #ffb300",
        }}
      />
      {imgSrc && (
        <img
          src={imgSrc}
          alt={data.label}
          style={{
            width: 60,
            height: 60,
            borderRadius: 6,
            marginBottom: 8,
            background: "#fff",
          }}
        />
      )}
      <div>{data.label}</div>
      {hovered && (
        <div className="card-tooltip-fadein">
          <div>
            <strong>Name:</strong> {data.label}
          </div>
          <div>
            <strong>Description:</strong> {data.description || "No description"}
          </div>
          <div>
            <strong>Power:</strong> {data.power ?? "?"}
          </div>
          <div>
            <strong>Rarity:</strong> {data.rarity || "Unknown"}
          </div>
        </div>
      )}
    </div>
  );
}
const nodeTypes = { cardNode: CardNode };

export default function Reviews() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [newCardLabel, setNewCardLabel] = useState("");
  const [editCardLabel, setEditCardLabel] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableCards, setAvailableCards] = useState([]);
  const [showCardLibrary, setShowCardLibrary] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);
  // const [generatingProgress, setGeneratingProgress] = useState(null);
  const [newCardReady, setNewCardReady] = useState(null);
  const [fusedCards, setFusedCards] = useState([]);
  const [showCardDropdown, setShowCardDropdown] = useState(false);
  const [selectedCardForGenealogy, setSelectedCardForGenealogy] = useState(null);
  const [showGenealogy, setShowGenealogy] = useState(false);
  const [genealogyNodes, setGenealogyNodes] = useState([]);
  const [genealogyEdges, setGenealogyEdges] = useState([]);

  // Initialize socket connection
  useEffect(() => {
    console.log('[fusion] Initializing socket connection...');
    const socket = socketService.connect();

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('[fusion] ✅ Connected to fusion guide room');
      socketService.emitJoinRoom('fusion-guide');
    });

    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log('[fusion] ❌ Disconnected from fusion guide room:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('[fusion] ❌ Socket connection error:', error);
      setIsConnected(false);
    });

    // Listen for real-time card updates
    socketService.onCardUpdate((data) => {
      console.log('Card update received:', data);
      // Update nodes if needed
      setNodes(prevNodes =>
        prevNodes.map(node =>
          node.id === data.id ? { ...node, data: { ...node.data, ...data } } : node
        )
      );
    });

    // Do not add any placeholder card on fusion request; wait for new-card-ready

    // Bỏ hiển thị progress generating theo yêu cầu

    // Lắng nghe new-card-ready event khi AI tạo ảnh xong
    socketService.onNewCardReady((data) => {
      console.log('New card ready received:', data);
      setNewCardReady(data);

      // Lưu thông tin thẻ bài đã ghép
      if (data.cardData) {
        const fusedCardData = {
          ...data.cardData,
          fusedAt: new Date().toISOString(),
          parentIds: data.parentIds || []
        };
        setFusedCards(prevCards => {
          const updatedCards = [...prevCards, fusedCardData];
          // Lưu vào localStorage
          try {
            localStorage.setItem(STORAGE_KEYS.fusedCards, JSON.stringify(updatedCards));
          } catch (err) {
            console.warn('Failed to save fused cards to localStorage:', err);
          }
          return updatedCards;
        });
      }

      // Thêm card mới vào workspace
      const newId = (data.cardId && /^[a-fA-F0-9]{24}$/.test(String(data.cardId)))
        ? String(data.cardId)
        : ensureUniqueId(generateUniqueId('ai_card'), nodes);
      const newX = 200 + Math.random() * 400;
      const newY = 200 + Math.random() * 300;

      setNodes(prevNodes => [
        ...prevNodes,
        {
          id: newId,
          type: "cardNode",
          position: { x: newX, y: newY },
          data: {
            label: data.cardData?.name || `AI Card ${newId}`,
            img: data.img || data.cardData?.imageUrl,
            description: data.cardData?.origin || `AI generated card from fusion`,
            power: data.cardData?.power || Math.floor(Math.random() * 100),
            rarity: "AI Generated",
            parentIds: data.parentIds,
            _id: /^[a-fA-F0-9]{24}$/.test(String(data.cardId || '')) ? String(data.cardId) : undefined,
            // Lưu thêm thông tin chi tiết
            genCore: data.cardData?.genCore,
            feature: data.cardData?.feature,
            symbol: data.cardData?.symbol,
            defense: data.cardData?.defense,
            magic: data.cardData?.magic,
            skill: data.cardData?.skill,
          },
        },
      ]);

      // Tạo edges từ parent cards nếu có
      if (data.parentIds && data.parentIds.length >= 2) {
        setEdges(prevEdges => [
          ...prevEdges,
          {
            id: generateUniqueEdgeId(data.parentIds[0], newId, 'socket'),
            source: data.parentIds[0],
            target: newId,
            type: "step",
            style: { stroke: "#4caf50", strokeWidth: 3 },
          },
          {
            id: generateUniqueEdgeId(data.parentIds[1], newId, 'socket'),
            source: data.parentIds[1],
            target: newId,
            type: "step",
            style: { stroke: "#4caf50", strokeWidth: 3 },
          },
        ]);
      }

      // Ẩn thông báo sau 5 giây
      setTimeout(() => {
        setNewCardReady(null);
      }, 5000);
    });

    return () => {
      socketService.emitLeaveRoom('fusion-guide');
      socketService.disconnect();
    };
  }, []);

  // Load cards from API (no local mock, no placeholders)
  useEffect(() => {
    const loadCards = async () => {
      setLoading(true);
      setError(null);
      try {
        const cards = await apiService.getAllCards();
        setAvailableCards(cards);

        const { nodes: apiNodes, edges: autoEdges } = syncDataAndCreateEdges(cards);

        // Kiểm tra và sửa duplicate IDs trước khi set
        const fixedNodes = fixDuplicateIds(apiNodes);
        setNodes(fixedNodes);
        setEdges(autoEdges);

        console.log(`Loaded ${apiNodes.length} cards with ${autoEdges.length} relationships`);
      } catch (err) {
        console.error('Failed to load cards:', err);
        setError('Failed to load cards from server');
      } finally {
        setLoading(false);
      }
    };

    loadCards();
  }, []);

  // Load from localStorage on mount (fallback)
  useEffect(() => {
    try {
      const savedNodes = localStorage.getItem(STORAGE_KEYS.nodes);
      const savedEdges = localStorage.getItem(STORAGE_KEYS.edges);
      const savedFusedCards = localStorage.getItem(STORAGE_KEYS.fusedCards);

      if (savedNodes && savedEdges && nodes.length <= 2) {
        const parsedNodes = JSON.parse(savedNodes);
        const parsedEdges = JSON.parse(savedEdges);
        if (Array.isArray(parsedNodes) && Array.isArray(parsedEdges)) {
          // Kiểm tra và sửa duplicate IDs trước khi load
          const fixedNodes = fixDuplicateIds(parsedNodes);
          setNodes(fixedNodes);
          setEdges(parsedEdges);

          // Tạo thêm edges từ parentIds nếu có
          const additionalEdges = [];
          parsedNodes.forEach(node => {
            if (node.data.parentIds && node.data.parentIds.length > 0) {
              node.data.parentIds.forEach(parentId => {
                const parentNode = parsedNodes.find(n => n.id === String(parentId));
                if (parentNode) {
                  const edgeId = generateUniqueEdgeId(parentId, node.id, 'local');
                  // Chỉ thêm nếu chưa có edge này
                  if (!parsedEdges.find(e => e.id === edgeId)) {
                    additionalEdges.push({
                      id: edgeId,
                      source: String(parentId),
                      target: node.id,
                      type: "step",
                      style: { stroke: "#4caf50", strokeWidth: 3 },
                      animated: true
                    });
                  }
                }
              });
            }
          });

          if (additionalEdges.length > 0) {
            setEdges([...parsedEdges, ...additionalEdges]);
            console.log(`Added ${additionalEdges.length} additional edges from parentIds`);
          }
        }
      }

      if (savedFusedCards) {
        const parsedFusedCards = JSON.parse(savedFusedCards);
        if (Array.isArray(parsedFusedCards)) {
          setFusedCards(parsedFusedCards);
        }
      }
    } catch (err) {
      // ignore storage errors
    }
  }, [setNodes, setEdges]);

  // Persist whenever nodes/edges change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.nodes, JSON.stringify(nodes));
      localStorage.setItem(STORAGE_KEYS.edges, JSON.stringify(edges));
    } catch (err) {
      // ignore storage errors
    }
  }, [nodes, edges]);

  const handleReset = () => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setSelectedNodes([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.nodes);
      localStorage.removeItem(STORAGE_KEYS.edges);
    } catch { }
  };

  // click chọn node (tối đa 2 để ghép)
  const onNodeClick = useCallback((event, node) => {
    setSelectedNodes((prev) => {
      if (prev.includes(node.id)) {
        return prev.filter((id) => id !== node.id);
      }
      if (prev.length < 2) {
        return [...prev, node.id];
      }
      return prev;
    });
  }, []);

  // Thêm card mới (tạo qua API, không tạo giả lập)
  const handleAddCard = async () => {
    if (!newCardLabel.trim()) return;
    setLoading(true);
    try {
      const cardData = {
        name: newCardLabel
      };
      const newCard = await apiService.createCard(cardData);
      // Sau khi BE tạo, reload danh sách từ API để đồng bộ
      const cards = await apiService.getAllCards();
      const { nodes: apiNodes, edges: autoEdges } = syncDataAndCreateEdges(cards);
      setNodes(apiNodes);
      setEdges(autoEdges);
      setNewCardLabel("");
    } catch (err) {
      console.error('Failed to create card:', err);
      setError('Failed to create card');
    } finally {
      setLoading(false);
    }
  };

  // Ghép 2 card lại thành card mới
  const handleMergeCard = async () => {
    if (selectedNodes.length !== 2) return;

    setLoading(true);
    try {
      const nodeA = nodes.find((n) => n.id === selectedNodes[0]);
      const nodeB = nodes.find((n) => n.id === selectedNodes[1]);

      const requestId = `req_${Date.now()}`;
      const autoName = `${nodeA?.data?.label || 'Card A'} + ${nodeB?.data?.label || 'Card B'}`;
      const fusionData = {
        requestId,
        card1Id: selectedNodes[0],
        card2Id: selectedNodes[1],
        resultName: autoName,
        card1Data: nodeA?.data,
        card2Data: nodeB?.data,
      };

      // Lấy cardID hợp lệ từ API nếu cần và validate ObjectId 24-hex
      const objectIdRegex = /^[a-fA-F0-9]{24}$/;
      const resolveCardId = async (node) => {
        const localId = node?.data?._id || node?.id;
        const normalized = localId ? String(localId).trim() : '';
        // Chỉ gọi API khi normalized đã là ObjectId; nếu không, trả về rỗng để báo lỗi
        if (objectIdRegex.test(normalized)) return normalized;
        return '';
      };

      const id1 = await resolveCardId(nodeA);
      const id2 = await resolveCardId(nodeB);
      if (!objectIdRegex.test(id1) || !objectIdRegex.test(id2)) {
        console.warn(`CardID không hợp lệ. Vui lòng chọn các thẻ được tải từ API (ObjectId 24-hex). id1='${String(nodeA?.data?._id || nodeA?.id || '')}', id2='${String(nodeB?.data?._id || nodeB?.id || '')}'`);
        setLoading(false);
        return;
      }

      // Gọi REST API theo Swagger: POST /cards/merge với JSON dạng { cardIds: [id1, id2] }
      try {
        await apiService.mergeCards({
          cardIds: [id1, id2]
        });
        console.log(`✅ Đã gửi ghép REST /cards/merge với cardIds=[${id1}, ${id2}]`);
      } catch (err) {
        console.warn('POST /cards/merge failed, falling back to socket emit', err?.message || err);
        // Fallback: Emit qua socket để BE/AI xử lý nếu REST không có
        socketService.emitCardFusion(fusionData);
        console.log('⚠️ REST /cards/merge lỗi, dùng socket fallback');
      }

      // Fusion được backend xử lý qua socket events; bỏ fallback API để tránh 404 spam

      setSelectedNodes([]);
    } catch (err) {
      console.error('Failed to start fusion via socket:', err);
      setError('Failed to start fusion');
    } finally {
      setLoading(false);
    }
  };

  // Update selected card name
  const handleUpdateCard = async () => {
    if (selectedNodes.length !== 1 || !editCardLabel.trim()) return;
    setLoading(true);
    try {
      const cardId = selectedNodes[0];
      await apiService.updateCard(cardId, { name: editCardLabel });
      const cards = await apiService.getAllCards();
      const { nodes: apiNodes, edges: autoEdges } = syncDataAndCreateEdges(cards);
      setNodes(apiNodes);
      setEdges(autoEdges);
      setEditCardLabel("");
      setSelectedNodes([]);
    } catch (err) {
      console.error('Failed to update card:', err);
      setError('Failed to update card');
    } finally {
      setLoading(false);
    }
  };

  // Delete selected card
  const handleDeleteCard = async () => {
    if (selectedNodes.length !== 1) return;
    setLoading(true);
    try {
      const cardId = selectedNodes[0];
      await apiService.deleteCard(cardId);
      const cards = await apiService.getAllCards();
      const { nodes: apiNodes, edges: autoEdges } = syncDataAndCreateEdges(cards);
      setNodes(apiNodes);
      setEdges(autoEdges);
      setSelectedNodes([]);
    } catch (err) {
      console.error('Failed to delete card:', err);
      setError('Failed to delete card');
    } finally {
      setLoading(false);
    }
  };


  // Function để tìm tất cả thẻ con của một thẻ
  const findChildCards = (parentCardId, allCards) => {
    return allCards.filter(card => {
      const parentIds = card.parentIds || card.parents || [];
      return parentIds.some(id => String(id) === String(parentCardId));
    });
  };

  // Function để xây dựng sơ đồ gia phả với công thức ghép
  const buildGenealogyTree = (cardId, allCards) => {
    const card = allCards.find(c => c._id === cardId || c.id === cardId);
    if (!card) return { nodes: [], edges: [] };

    const nodes = [];
    const edges = [];

    // Tạo node cho thẻ hiện tại (thẻ gốc)
    const currentNode = {
      id: cardId,
      type: "cardNode",
      position: { x: 0, y: 0 },
      data: {
        label: card.name || card.label || 'Unknown Card',
        img: card.imageUrl || card.image || card.img,
        description: card.origin || card.description || 'No description',
        power: card.power || 0,
        rarity: card.rarity || 'Unknown',
        _id: card._id || card.id,
        genCore: card.genCore,
        feature: card.feature,
        symbol: card.symbol,
        defense: card.defense,
        magic: card.magic,
        skill: card.skill,
        isRoot: true
      }
    };
    nodes.push(currentNode);

    // Tìm các thẻ cha (công thức tạo ra thẻ này)
    const parentIds = card.parentIds || card.parents || [];
    let parentYOffset = -200;
    let parentXOffset = -150;

    // Hiển thị 2 thẻ cha nếu có (công thức ghép)
    if (parentIds.length >= 2) {
      parentIds.slice(0, 2).forEach((parentId, index) => {
        const parentCard = allCards.find(c => c._id === parentId || c.id === parentId);
        if (parentCard) {
          const parentNode = {
            id: parentId,
            type: "cardNode",
            position: {
              x: parentXOffset + (index * 300),
              y: parentYOffset
            },
            data: {
              label: parentCard.name || parentCard.label || 'Unknown Parent',
              img: parentCard.imageUrl || parentCard.image || parentCard.img,
              description: parentCard.origin || parentCard.description || 'No description',
              power: parentCard.power || 0,
              rarity: parentCard.rarity || 'Unknown',
              _id: parentCard._id || parentCard.id,
              genCore: parentCard.genCore,
              feature: parentCard.feature,
              symbol: parentCard.symbol,
              defense: parentCard.defense,
              magic: parentCard.magic,
              skill: parentCard.skill,
              isParent: true
            }
          };
          nodes.push(parentNode);

          // Tạo edge từ thẻ cha đến thẻ con
          edges.push({
            id: generateUniqueEdgeId(parentId, cardId, 'parent'),
            source: parentId,
            target: cardId,
            type: "step",
            style: { stroke: "#4caf50", strokeWidth: 3 },
            animated: true
          });
        }
      });

      // Thêm dấu + giữa 2 thẻ cha
      if (parentIds.length >= 2) {
        const plusNode = {
          id: `plus-${cardId}`,
          type: "cardNode",
          position: {
            x: 0,
            y: parentYOffset - 50
          },
          data: {
            label: "+",
            img: null,
            description: "Công thức ghép",
            power: 0,
            rarity: "Recipe",
            _id: `plus-${cardId}`,
            isRecipe: true
          }
        };
        nodes.push(plusNode);
      }
    }

    // Tìm các thẻ con (các thẻ được tạo từ thẻ này + thẻ khác)
    const childCards = findChildCards(cardId, allCards);
    let childYOffset = 200;
    let childXOffset = -150;

    childCards.forEach((childCard, index) => {
      const childId = childCard._id || childCard.id;
      const childNode = {
        id: childId,
        type: "cardNode",
        position: {
          x: childXOffset + (index * 300),
          y: childYOffset
        },
        data: {
          label: childCard.name || childCard.label || 'Unknown Child',
          img: childCard.imageUrl || childCard.image || childCard.img,
          description: childCard.origin || childCard.description || 'No description',
          power: childCard.power || 0,
          rarity: childCard.rarity || 'Unknown',
          _id: childCard._id || childCard.id,
          genCore: childCard.genCore,
          feature: childCard.feature,
          symbol: childCard.symbol,
          defense: childCard.defense,
          magic: childCard.magic,
          skill: childCard.skill,
          isChild: true
        }
      };
      nodes.push(childNode);

      // Tạo edge từ thẻ hiện tại đến thẻ con
      edges.push({
        id: generateUniqueEdgeId(cardId, childId, 'child'),
        source: cardId,
        target: childId,
        type: "step",
        style: { stroke: "#2196f3", strokeWidth: 3 },
        animated: true
      });
    });


    return { nodes, edges };
  };

  // Function để hiển thị sơ đồ gia phả
  const showCardGenealogy = (card) => {
    // Sử dụng dữ liệu từ nodes (đã có đầy đủ thông tin) và fusedCards
    const allCards = [...nodes.map(n => n.data), ...fusedCards];
    const genealogy = buildGenealogyTree(card._id || card.id, allCards);

    console.log(`🔍 Building genealogy for: ${card.name || card.label}`);
    console.log(`📊 Found ${genealogy.nodes.length} nodes and ${genealogy.edges.length} edges`);

    setSelectedCardForGenealogy(card);
    setGenealogyNodes(genealogy.nodes);
    setGenealogyEdges(genealogy.edges);
    setShowGenealogy(true);
    setShowCardDropdown(false);
  };

  // Function để xử lý click vào thẻ trong sơ đồ gia phả
  const handleGenealogyNodeClick = (event, node) => {
    // Bỏ qua click vào node công thức
    if (node.data?.isRecipe) {
      return;
    }

    // Tìm thẻ tương ứng với node được click
    const allCards = [...nodes.map(n => n.data), ...fusedCards];
    const clickedCard = allCards.find(card =>
      String(card._id || card.id) === String(node.id)
    );

    if (clickedCard) {
      console.log(`🔄 Switching genealogy to: ${clickedCard.name || clickedCard.label}`);
      // Hiển thị sơ đồ gia phả của thẻ được click
      showCardGenealogy(clickedCard);
    }
  };

  // Function để hiển thị tooltip khi hover vào thẻ trong sơ đồ gia phả
  const handleGenealogyNodeMouseEnter = (event, node) => {
    // Có thể thêm tooltip hiển thị thông tin chi tiết
    console.log('Hovering over card:', node.data.label);
  };

  const closeGenealogy = () => {
    setShowGenealogy(false);
    setSelectedCardForGenealogy(null);
    setGenealogyNodes([]);
    setGenealogyEdges([]);
  };

  // Function để tạo unique edge ID
  const generateUniqueEdgeId = (source, target, type = 'default') => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${type}-${source}-${target}-${timestamp}-${random}`;
  };


  // Function để sync dữ liệu từ API và tạo edges
  const syncDataAndCreateEdges = (cards) => {
    const apiNodes = cards.map((card, index) => ({
      id: (card && (card._id || card.id)) ? String(card._id || card.id) : ensureUniqueId(generateUniqueId('api_card'), nodes),
      type: "cardNode",
      position: { x: 100 + (index % 6) * 150, y: 100 + Math.floor(index / 6) * 160 },
      data: {
        label: card.name || card.label,
        img: card.imageUrl || card.image,
        description: card.origin || card.description,
        power: card.power,
        rarity: card.rarity,
        _id: card?._id || card?.id,
        genCore: card.genCore,
        feature: card.feature,
        symbol: card.symbol,
        defense: card.defense,
        magic: card.magic,
        skill: card.skill,
        parentIds: card.parents || card.parentIds || [],
        imageUrl: card.imageUrl,
        createdAt: card.createdAt,
        updatedAt: card.updatedAt,
      },
    }));

    // Tạo edges từ parentIds
    const autoEdges = [];
    apiNodes.forEach(node => {
      if (node.data.parentIds && node.data.parentIds.length > 0) {
        node.data.parentIds.forEach(parentId => {
          const parentNode = apiNodes.find(n => n.id === String(parentId));
          if (parentNode) {
            autoEdges.push({
              id: generateUniqueEdgeId(parentId, node.id, 'sync'),
              source: String(parentId),
              target: node.id,
              type: "step",
              style: { stroke: "#4caf50", strokeWidth: 3 },
              animated: true
            });
          }
        });
      }
    });

    return { nodes: apiNodes, edges: autoEdges };
  };

  // Handle card selection from library
  const handleCardSelect = (card) => {
    const newId = card.id || ensureUniqueId(generateUniqueId('library_card'), nodes);
    const newX = 100 + Math.random() * 400;
    const newY = 100 + Math.random() * 300;

    setNodes((nds) => [
      ...nds,
      {
        id: newId,
        type: "cardNode",
        position: { x: newX, y: newY },
        data: {
          label: card.name || card.label,
          img: card.image || cardImg,
          description: card.description,
          power: card.power,
          rarity: card.rarity,
        },
      },
    ]);
  };

  // highlight node đang chọn
  const customNodes = nodes.map((node) => ({
    ...node,
    selected: selectedNodes.includes(node.id),
  }));

  return (
    <div className="reviews-page">
      <Header />

      {/* Connection Status */}
      <div className="connection-status">
        <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
          <span className="status-dot"></span>
          {isConnected ? 'Connected to Server' : 'Disconnected from Server'}
        </div>
        {loading && <div className="loading-indicator">Loading...</div>}
        {error && <div className="error-message">{error}</div>}
        {usingMockData && (
          <div className="mock-data-warning">
            ⚠️ Using demo data - API not available
          </div>
        )}
        {newCardReady && (
          <div className="new-card-notification">
            🎉 New AI card ready! Card ID: {newCardReady.cardId}
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <button
          onClick={handleMergeCard}
          disabled={selectedNodes.length !== 2 || loading}
          className={`btn-merge ${selectedNodes.length === 2 && !loading ? "btn-merge-active" : "btn-merge-disabled"}`}
        >
          {loading ? 'Fusing...' : 'Ghép Card'}
        </button>

        <div className="dropdown-container">
          <button
            onClick={() => setShowCardDropdown(!showCardDropdown)}
            className={`btn-toggle ${showCardDropdown ? 'active' : ''}`}
          >
            Sơ Đồ Gia Phả ▼
          </button>

          {showCardDropdown && (
            <div className="card-dropdown">
              <div className="dropdown-header">
                <h3>Chọn thẻ để xem sơ đồ gia phả</h3>
                <button
                  onClick={() => setShowCardDropdown(false)}
                  className="close-btn"
                >
                  ✕
                </button>
              </div>
              <div className="dropdown-content">
                {nodes.length === 0 && fusedCards.length === 0 ? (
                  <div className="no-cards">Chưa có thẻ bài nào</div>
                ) : (
                  <div className="cards-list">
                    {/* Hiển thị thẻ từ workspace */}
                    {nodes.map((node) => (
                      <div
                        key={node.id}
                        className="card-item"
                        onClick={() => showCardGenealogy(node.data)}
                      >
                        <img
                          src={node.data.img || fallbackImg}
                          alt={node.data.label}
                          className="card-thumbnail"
                        />
                        <div className="card-info">
                          <div className="card-name">{node.data.label}</div>
                          <div className="card-type">Thẻ Workspace</div>
                        </div>
                      </div>
                    ))}

                    {/* Hiển thị thẻ đã ghép */}
                    {fusedCards.map((card, idx) => (
                      <div
                        key={card._id || idx}
                        className="card-item"
                        onClick={() => showCardGenealogy(card)}
                      >
                        <img
                          src={card.imageUrl || fallbackImg}
                          alt={card.name}
                          className="card-thumbnail"
                        />
                        <div className="card-info">
                          <div className="card-name">{card.name}</div>
                          <div className="card-type">Thẻ Đã Ghép</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Library */}
      {showCardLibrary && (
        <div className="card-library-container">
          <CardLibrary onCardSelect={handleCardSelect} />
        </div>
      )}

      {/* Flow Area */}
      <div className="flow-container">
        <ReactFlow
          nodes={customNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background color="#aaa" gap={32} />
          <MiniMap />
          <Controls />
        </ReactFlow>
      </div>


      {/* Genealogy Modal */}
      {showGenealogy && (
        <div className="genealogy-modal" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.9)',
          zIndex: 2000,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px',
            background: 'rgba(0,0,0,0.8)',
            borderBottom: '2px solid #4caf50'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <h2 style={{ margin: 0, color: '#4caf50' }}>
                Sơ Đồ Gia Phả: {selectedCardForGenealogy?.name || selectedCardForGenealogy?.label}
              </h2>
              <div style={{ fontSize: '14px', color: '#888' }}>
                Click vào thẻ để xem sơ đồ gia phả của thẻ đó
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  // Quay lại dropdown để chọn thẻ khác
                  setShowGenealogy(false);
                  setShowCardDropdown(true);
                }}
                style={{
                  background: '#2196f3',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                ← Chọn Thẻ Khác
              </button>
              <button
                onClick={closeGenealogy}
                style={{
                  background: '#f44336',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                ✕ Đóng
              </button>
            </div>
          </div>

          <div style={{ flex: 1, position: 'relative' }}>
            {genealogyNodes.length <= 1 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#fff',
                textAlign: 'center',
                padding: '40px'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '20px', color: '#4caf50' }}>
                  🌳 Sơ Đồ Gia Phả
                </div>
                <div style={{ fontSize: '18px', marginBottom: '10px' }}>
                  {selectedCardForGenealogy?.name || selectedCardForGenealogy?.label}
                </div>
                <div style={{ fontSize: '16px', color: '#888' }}>
                  Thẻ này chưa có thông tin gia phả (cha mẹ hoặc con cái)
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginTop: '20px' }}>
                  Thẻ sẽ có gia phả khi được ghép từ các thẻ khác hoặc được sử dụng để ghép tạo thẻ mới
                </div>
              </div>
            ) : (
              <ReactFlow
                nodes={genealogyNodes}
                edges={genealogyEdges}
                onNodeClick={handleGenealogyNodeClick}
                onNodeMouseEnter={handleGenealogyNodeMouseEnter}
                nodeTypes={nodeTypes}
                fitView
                style={{ background: 'transparent' }}
              >
                <Background color="#333" gap={32} />
                <MiniMap
                  style={{ background: 'rgba(0,0,0,0.8)', border: '1px solid #4caf50' }}
                  nodeColor={(node) => {
                    if (node.data?.isRoot) return '#4caf50';
                    if (node.data?.isParent) return '#2196f3';
                    if (node.data?.isChild) return '#ff9800';
                    if (node.data?.isRecipe) return '#9c27b0';
                    return '#666';
                  }}
                />
                <Controls
                  style={{ background: 'rgba(0,0,0,0.8)', border: '1px solid #4caf50' }}
                />
              </ReactFlow>
            )}
          </div>

          <div style={{
            padding: '15px 20px',
            background: 'rgba(0,0,0,0.8)',
            borderTop: '1px solid #4caf50',
            color: '#fff',
            fontSize: '14px'
          }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '20px', height: '20px', background: '#4caf50', borderRadius: '4px' }}></div>
                <span>Thẻ Gốc</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '20px', height: '20px', background: '#2196f3', borderRadius: '4px' }}></div>
                <span>Thẻ Cha</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '20px', height: '20px', background: '#ff9800', borderRadius: '4px' }}></div>
                <span>Thẻ Con</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '20px', height: '20px', background: '#9c27b0', borderRadius: '50%' }}></div>
                <span>Công Thức Ghép</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress modal removed by request */}
    </div>
  );
}