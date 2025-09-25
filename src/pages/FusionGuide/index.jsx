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
};

function CardNode({ data, selected }) {
  const [hovered, setHovered] = useState(false);
  const imgSrc = data.img && typeof data.img === 'string' && data.img.trim().length > 0 ? data.img : fallbackImg;

  return (
    <div
      style={{
        width: 80,
        height: 120,
        background: selected ? "#ffe082" : "#222",
        border: selected ? "3px solid #ffb300" : "2px solid #444",
        borderRadius: 10,
        boxShadow: "0 2px 8px #0008",
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
  const [showHistory, setShowHistory] = useState(false);
  const [showRecipes, setShowRecipes] = useState(false);
  const [fusionHistory, setFusionHistory] = useState([]);
  const [fusionRecipes, setFusionRecipes] = useState([]);
  const [sentLinks, setSentLinks] = useState(null);
  const [mergeStatus, setMergeStatus] = useState(null);

  // Initialize socket connection
  useEffect(() => {
    const socket = socketService.connect();

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to fusion guide room');
      socketService.emitJoinRoom('fusion-guide');
    });

    socket.on('disconnect', () => {
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

      // Thêm card mới vào workspace
      const newId = (data.cardId && /^[a-fA-F0-9]{24}$/.test(String(data.cardId)))
        ? String(data.cardId)
        : (nodes.length + 1).toString();
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
            img: data.img,
            description: `AI generated card from fusion`,
            power: Math.floor(Math.random() * 100),
            rarity: "AI Generated",
            parentIds: data.parentIds,
            _id: /^[a-fA-F0-9]{24}$/.test(String(data.cardId || '')) ? String(data.cardId) : undefined,
          },
        },
      ]);

      // Tạo edges từ parent cards nếu có
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

        const apiNodes = cards.map((card, index) => ({
          id: (card && (card._id || card.id)) ? String(card._id || card.id) : (index + 1).toString(),
          type: "cardNode",
          position: { x: 100 + (index % 6) * 150, y: 100 + Math.floor(index / 6) * 160 },
          data: {
            label: card.name || card.label,
            img: card.image,
            description: card.description,
            power: card.power,
            rarity: card.rarity,
            _id: card?._id || card?.id,
          },
        }));
        setNodes(apiNodes);
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
      if (savedNodes && savedEdges && nodes.length <= 2) {
        const parsedNodes = JSON.parse(savedNodes);
        const parsedEdges = JSON.parse(savedEdges);
        if (Array.isArray(parsedNodes) && Array.isArray(parsedEdges)) {
          setNodes(parsedNodes);
          setEdges(parsedEdges);
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
      const apiNodes = cards.map((card, index) => ({
        id: card.id?.toString() || (index + 1).toString(),
        type: "cardNode",
        position: { x: 100 + (index % 6) * 150, y: 100 + Math.floor(index / 6) * 160 },
        data: {
          label: card.name || card.label,
          img: card.image,
          description: card.description,
          power: card.power,
          rarity: card.rarity,
        },
      }));
      setNodes(apiNodes);
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
        setMergeStatus({ type: 'warning', text: `CardID không hợp lệ. Vui lòng chọn các thẻ được tải từ API (ObjectId 24-hex). id1='${String(nodeA?.data?._id || nodeA?.id || '')}', id2='${String(nodeB?.data?._id || nodeB?.id || '')}'` });
        setTimeout(() => setMergeStatus(null), 5000);
        setLoading(false);
        return;
      }

      // Hiển thị thông báo tạm với 2 ID hợp lệ
      setSentLinks({ id1, id2, at: Date.now() });
      setTimeout(() => setSentLinks(null), 6000);

      // Gọi REST API theo Swagger: POST /cards/merge với JSON dạng { cardIds: [id1, id2] }
      try {
        await apiService.mergeCards({
          cardIds: [id1, id2]
        });
        setMergeStatus({ type: 'success', text: `Đã gửi ghép REST /cards/merge với cardIds=[${id1}, ${id2}]` });
        setTimeout(() => setMergeStatus(null), 4000);
      } catch (err) {
        console.warn('POST /cards/merge failed, falling back to socket emit', err?.message || err);
        // Fallback: Emit qua socket để BE/AI xử lý nếu REST không có
        socketService.emitCardFusion(fusionData);
        setMergeStatus({ type: 'warning', text: 'REST /cards/merge lỗi, dùng socket fallback' });
        setTimeout(() => setMergeStatus(null), 4000);
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
      const apiNodes = cards.map((card, index) => ({
        id: card.id?.toString() || (index + 1).toString(),
        type: "cardNode",
        position: { x: 100 + (index % 6) * 150, y: 100 + Math.floor(index / 6) * 160 },
        data: {
          label: card.name || card.label,
          img: card.image,
          description: card.description,
          power: card.power,
          rarity: card.rarity,
        },
      }));
      setNodes(apiNodes);
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
      const apiNodes = cards.map((card, index) => ({
        id: card.id?.toString() || (index + 1).toString(),
        type: "cardNode",
        position: { x: 100 + (index % 6) * 150, y: 100 + Math.floor(index / 6) * 160 },
        data: {
          label: card.name || card.label,
          img: card.image,
          description: card.description,
          power: card.power,
          rarity: card.rarity,
        },
      }));
      setNodes(apiNodes);
      setSelectedNodes([]);
    } catch (err) {
      console.error('Failed to delete card:', err);
      setError('Failed to delete card');
    } finally {
      setLoading(false);
    }
  };

  // Toggle panels and load data
  const toggleHistory = async () => {
    const next = !showHistory;
    setShowHistory(next);
    if (next) {
      try {
        const data = await apiService.getFusionHistory();
        setFusionHistory(Array.isArray(data) ? data : []);
      } catch (e) {
        console.warn('Failed to load fusion history');
        setFusionHistory([]);
      }
    }
  };

  const toggleRecipes = async () => {
    const next = !showRecipes;
    setShowRecipes(next);
    if (next) {
      try {
        const data = await apiService.getFusionRecipes();
        setFusionRecipes(Array.isArray(data) ? data : []);
      } catch (e) {
        console.warn('Failed to load fusion recipes');
        setFusionRecipes([]);
      }
    }
  };

  // Handle card selection from library
  const handleCardSelect = (card) => {
    const newId = card.id || (nodes.length + 1).toString();
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
        {mergeStatus && (
          <div className="new-card-notification" style={{
            borderColor: mergeStatus.type === 'success' ? 'rgba(76,175,80,0.3)' : 'rgba(255,152,0,0.3)',
            background: mergeStatus.type === 'success' ? 'rgba(76,175,80,0.1)' : 'rgba(255,152,0,0.1)'
          }}>
            {mergeStatus.text}
          </div>
        )}
        {sentLinks && (
          <div className="new-card-notification">
            ✅ Đã gửi 2 cardIds: [{sentLinks.id1}], [{sentLinks.id2}]
          </div>
        )}
        {newCardReady && (
          <div className="new-card-notification">
            🎉 New AI card ready! Card ID: {newCardReady.cardId}
          </div>
        )}
      </div>

      {/* Toolbar - only the fusion button remains */}
      <div className="toolbar">
        <button
          onClick={handleMergeCard}
          disabled={selectedNodes.length !== 2 || loading}
          className={`btn-merge ${selectedNodes.length === 2 && !loading ? "btn-merge-active" : "btn-merge-disabled"}`}
        >
          {loading ? 'Fusing...' : 'Ghép Card'}
        </button>
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

      {/* Panels */}
      {showHistory && (
        <div className="panel-list" style={{ maxHeight: 200, overflow: 'auto', background: 'rgba(0,0,0,0.5)', color: '#fff', padding: 12 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 8 }}>Fusion History</div>
          {fusionHistory.length === 0 ? (
            <div>Không có dữ liệu</div>
          ) : (
            fusionHistory.map((item, idx) => (
              <div key={idx} style={{ padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div>{item.resultName || item.result?.name || 'Unknown Result'}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>
                  {item.card1Id} + {item.card2Id} → {item.resultId || item.result?.id}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showRecipes && (
        <div className="panel-list" style={{ maxHeight: 200, overflow: 'auto', background: 'rgba(0,0,0,0.5)', color: '#fff', padding: 12 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 8 }}>Fusion Recipes</div>
          {fusionRecipes.length === 0 ? (
            <div>Không có dữ liệu</div>
          ) : (
            fusionRecipes.map((recipe, idx) => (
              <div key={idx} style={{ padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div>{recipe.resultName || recipe.result?.name || 'Unknown'}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>
                  {Array.isArray(recipe.parents) ? recipe.parents.join(' + ') : '—'}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Progress modal removed by request */}
    </div>
  );
}