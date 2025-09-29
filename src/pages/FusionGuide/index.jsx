import React, { useState, useCallback, useEffect, useMemo } from "react";
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
import CardDetailModal from "../../components/CardDetailModal";
import CombinationModal from "../../components/CombinationModal";
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
  const [selectedCard, setSelectedCard] = useState(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [showCardList, setShowCardList] = useState(false);
  const [combinationCard, setCombinationCard] = useState(null);
  const [isCombinationModalOpen, setIsCombinationModalOpen] = useState(false);

  // Initialize socket connection with improved error handling and reconnection
  useEffect(() => {
    const socket = socketService.connect();

    const handleConnect = () => {
      setIsConnected(true);
      console.log('Connected to fusion guide room');
      socketService.emitJoinRoom('fusion-guide');
      setError(null); // Clear any previous errors
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    };

    const handleConnectError = (error) => {
      console.error('Socket connection error:', error);
      setError('Connection failed. Retrying...');
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

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

    // Listen for card fusion events
    socketService.onCardFusion((data) => {
      console.log('Card fusion event received:', data);
      // Update fusion history if needed
      if (data.result) {
        setFusionHistory(prev => [data, ...prev.slice(0, 9)]); // Keep last 10
      }
    });

    // Listen for new card added events
    socketService.onCardAdded((data) => {
      console.log('New card added event received:', data);
      // Refresh available cards
      loadAvailableCards();
    });

    // Listen for new-card-ready event when AI finishes creating image
    socketService.onNewCardReady((data) => {
      console.log('New card ready received:', data);
      setNewCardReady(data);

      // Add new card to workspace
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
            label: data.name || `AI Card ${newId}`,
            img: data.img,
            description: data.description || `AI generated card from fusion`,
            power: data.power || Math.floor(Math.random() * 100),
            rarity: data.rarity || "AI Generated",
            parentIds: data.parentIds,
            _id: /^[a-fA-F0-9]{24}$/.test(String(data.cardId || '')) ? String(data.cardId) : undefined,
          },
        },
      ]);

      // Create edges from parent cards if available
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

      // Hide notification after 5 seconds
      setTimeout(() => {
        setNewCardReady(null);
      }, 5000);
    });

    return () => {
      socketService.emitLeaveRoom('fusion-guide');
      socketService.disconnect();
    };
  }, []);

  // Load available cards from API with improved error handling
  const loadAvailableCards = async () => {
    try {
      const cards = await apiService.getAllCards();
      setAvailableCards(cards);
      setUsingMockData(false);
      return cards;
    } catch (err) {
      console.error('Failed to load cards:', err);
      setError('Failed to load cards from server');
      setUsingMockData(true);
      return [];
    }
  };

  // Load cards from API (no local mock, no placeholders)
  useEffect(() => {
    const loadCards = async () => {
      setLoading(true);
      setError(null);
      
      const cards = await loadAvailableCards();
      
      if (cards.length > 0) {
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
      }
      
      setLoading(false);
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

  // click vào node để hiển thị sơ đồ chi tiết
  const onNodeClick = useCallback((event, node) => {
    handleCardClick(node.data);
  }, []);




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

  // Handle card detail modal
  const handleCardClick = (card) => {
    setSelectedCard(card);
    setIsCardModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCardModalOpen(false);
    setSelectedCard(null);
  };

  // Handle combination view
  const handleViewCombination = (card) => {
    setCombinationCard(card);
    setIsCombinationModalOpen(true);
  };

  const handleCloseCombinationModal = () => {
    setIsCombinationModalOpen(false);
    setCombinationCard(null);
  };

  // Memoized custom nodes for better performance
  const customNodes = useMemo(() => 
    nodes.map((node) => ({
      ...node,
    })), [nodes]
  );

  // Debounced API calls for better performance
  const debouncedLoadCards = useCallback(
    debounce(async () => {
      await loadAvailableCards();
    }, 300),
    []
  );

  // Helper function for debouncing
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Helper function for rarity class
  const getRarityClass = (rarity) => {
    if (!rarity) return 'rarity-unknown';
    return `rarity-${rarity.toLowerCase().replace(/\s+/g, '-')}`;
  };

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

      {/* Enhanced Toolbar with Card Library controls */}
      <div className="toolbar">
        <div className="toolbar-section">
          <button
            onClick={() => setShowCardLibrary(!showCardLibrary)}
            className="btn-library"
          >
            {showCardLibrary ? 'Hide Library' : 'Show Library'}
          </button>
          
          <button
            onClick={() => setShowCardList(!showCardList)}
            className="btn-list"
          >
            {showCardList ? 'Hide List' : 'Show List'}
          </button>
          
          <button
            onClick={toggleHistory}
            className="btn-history"
          >
            {showHistory ? 'Hide History' : 'Show History'}
          </button>
          
          <button
            onClick={toggleRecipes}
            className="btn-recipes"
          >
            {showRecipes ? 'Hide Recipes' : 'Show Recipes'}
          </button>
        </div>
        
        
        
        <div className="toolbar-section">
          <button
            onClick={handleReset}
            className="btn-reset"
          >
            Reset Workspace
          </button>
        </div>
      </div>

      {/* Enhanced Card Library with filters */}
      {showCardLibrary && (
        <div className="card-library-container">
          <div className="library-header">
            <h3>Card Library ({availableCards.length} cards)</h3>
            <div className="library-filters">
              <select 
                onChange={(e) => {
                  const rarity = e.target.value;
                  // Filter cards by rarity
                  const filteredCards = rarity === 'all' 
                    ? availableCards 
                    : availableCards.filter(card => card.rarity === rarity);
                  // Update CardLibrary with filtered cards
                }}
                className="rarity-filter"
              >
                <option value="all">All Rarities</option>
                <option value="Common">Common</option>
                <option value="Uncommon">Uncommon</option>
                <option value="Rare">Rare</option>
                <option value="Epic">Epic</option>
                <option value="Legendary">Legendary</option>
                <option value="AI Generated">AI Generated</option>
              </select>
            </div>
          </div>
          <CardLibrary 
            onCardSelect={handleCardSelect} 
            availableCards={availableCards}
            loading={loading}
          />
        </div>
      )}

      {/* Card List View */}
      {showCardList && (
        <div className="card-list-container">
          <div className="list-header">
            <h3>All Cards ({nodes.length} cards in workspace)</h3>
            <div className="list-controls">
              <button 
                onClick={() => setShowCardList(false)}
                className="btn-close-list"
              >
                ×
              </button>
            </div>
          </div>
          <div className="card-grid">
            {nodes.map((node) => (
              <div 
                key={node.id}
                className="card-item"
                onClick={() => handleCardClick(node.data)}
              >
                <div className="card-image">
                  <img 
                    src={node.data.img || fallbackImg} 
                    alt={node.data.label}
                    className="card-thumbnail"
                  />
                </div>
                <div className="card-info">
                  <div className="card-name">{node.data.label}</div>
                  <div className="card-details">
                    <span className={`rarity-badge ${getRarityClass(node.data.rarity)}`}>
                      {node.data.rarity || 'Unknown'}
                    </span>
                    <span className="power-value">
                      Power: {node.data.power ?? '?'}
                    </span>
                  </div>
                </div>
                <div className="card-actions">
                  <button 
                    className="btn-view-combination"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewCombination(node.data);
                    }}
                  >
                    View Combination
                  </button>
                </div>
              </div>
            ))}
          </div>
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

      {/* Card Detail Modal */}
      <CardDetailModal 
        card={selectedCard}
        isOpen={isCardModalOpen}
        onClose={handleCloseModal}
      />

      {/* Combination Modal */}
      <CombinationModal 
        card={combinationCard}
        isOpen={isCombinationModalOpen}
        onClose={handleCloseCombinationModal}
        allCards={nodes.map(node => ({
          id: node.id,
          _id: node.data._id,
          label: node.data.label,
          img: node.data.img,
          power: node.data.power,
          rarity: node.data.rarity,
          description: node.data.description
        }))}
      />
    </div>
  );
}