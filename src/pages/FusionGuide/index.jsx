import React, { useState, useCallback, useEffect, useRef } from "react";
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
import "./styles.css";
import Header from "../../components/Header";

const cardImg =
  "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg";

const initialNodes = [
  {
    id: "1",
    type: "cardNode",
    position: { x: 100, y: 100 },
    data: {
      label: "A1",
      img: cardImg,
      description: "A1 is a legendary warrior card.",
      power: 90,
      rarity: "Legendary",
    },
  },
  {
    id: "2",
    type: "cardNode",
    position: { x: 400, y: 100 },
    data: {
      label: "A2",
      img: cardImg,
      description: "A2 is a defensive guardian card.",
      power: 70,
      rarity: "Epic",
    },
  },
];

const initialEdges = [];

const STORAGE_KEYS = {
  nodes: "fusionGuide:nodes",
  edges: "fusionGuide:edges",
};

function CardNode({ data, selected }) {
  const [hovered, setHovered] = useState(false);

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
      <img
        src={data.img}
        alt={data.label}
        style={{
          width: 60,
          height: 60,
          borderRadius: 6,
          marginBottom: 8,
          background: "#fff",
        }}
      />
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
  const [isHydrated, setIsHydrated] = useState(false);

  // Load từ localStorage
  useEffect(() => {
    try {
      const savedNodesStr = localStorage.getItem(STORAGE_KEYS.nodes);
      const savedEdgesStr = localStorage.getItem(STORAGE_KEYS.edges);

      let nextNodes = JSON.parse(savedNodesStr || "[]");
      let nextEdges = JSON.parse(savedEdgesStr || "[]");

      if (!nextNodes.length) nextNodes = initialNodes;
      if (!nextEdges.length) nextEdges = initialEdges;

      setNodes(nextNodes);
      setEdges(nextEdges);
    } catch {
      setNodes(initialNodes);
      setEdges(initialEdges);
    } finally {
      setIsHydrated(true);
    }
  }, [setNodes, setEdges]);

  // Save vào localStorage mỗi khi nodes/edges đổi
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.nodes, JSON.stringify(nodes));
      localStorage.setItem(STORAGE_KEYS.edges, JSON.stringify(edges));
    } catch {}
  }, [nodes, edges, isHydrated]);

  // Reset
  const handleReset = () => {
    const nextNodes = nodes.filter((n) => n?.data?.rarity !== "Fusion");
    const nextEdges = [];
    setNodes(nextNodes);
    setEdges(nextEdges);
    setSelectedNodes([]);
  };

  // Click chọn node
  const onNodeClick = useCallback((_, node) => {
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

  // Thêm card mới
  const handleAddCard = () => {
    if (!newCardLabel.trim()) return;
    const newId = (nodes.length + 1).toString();
    const newX = 50 + Math.random() * 500;
    const newY = 50 + Math.random() * 300;

    setNodes([
      ...nodes,
      {
        id: newId,
        type: "cardNode",
        position: { x: newX, y: newY },
        data: {
          label: newCardLabel,
          img: cardImg,
          description: `${newCardLabel} is a newly created card.`,
          power: Math.floor(Math.random() * 100),
          rarity: "Common",
        },
      },
    ]);
    setNewCardLabel("");
  };

  // Ghép 2 card lại
  const handleMergeCard = () => {
    if (selectedNodes.length !== 2 || !newCardLabel.trim()) return;

    const nodeA = nodes.find((n) => n.id === selectedNodes[0]);
    const nodeB = nodes.find((n) => n.id === selectedNodes[1]);

    const newX = (nodeA.position.x + nodeB.position.x) / 2;
    const newY = Math.max(nodeA.position.y, nodeB.position.y) + 150;

    const newId = (nodes.length + 1).toString();

    setNodes([
      ...nodes,
      {
        id: newId,
        type: "cardNode",
        position: { x: newX, y: newY },
        data: {
          label: newCardLabel,
          img: cardImg,
          description: `Merged from ${nodeA.data.label} and ${nodeB.data.label}.`,
          power: Math.floor(
            ((nodeA.data.power ?? 50) + (nodeB.data.power ?? 50)) / 2
          ),
          rarity: "Fusion",
        },
      },
    ]);

    setEdges([
      ...edges,
      {
        id: `e${selectedNodes[0]}-${newId}`,
        source: selectedNodes[0],
        target: newId,
        type: "step",
        style: { stroke: "#fff", strokeWidth: 3 },
      },
      {
        id: `e${selectedNodes[1]}-${newId}`,
        source: selectedNodes[1],
        target: newId,
        type: "step",
        style: { stroke: "#fff", strokeWidth: 3 },
      },
    ]);

    setSelectedNodes([]);
    setNewCardLabel("");
  };

  // highlight node được chọn
  const customNodes = nodes.map((node) => ({
    ...node,
    selected: selectedNodes.includes(node.id),
  }));

  return (
    <div className="reviews-page">
      <Header />

      {/* Toolbar */}
      <div className="toolbar">
        <input
          type="text"
          placeholder="Tên Card mới"
          value={newCardLabel}
          onChange={(e) => setNewCardLabel(e.target.value)}
        />
        <button onClick={handleAddCard} className="btn-add">
          + Thêm Card
        </button>
        <button
          onClick={handleMergeCard}
          disabled={selectedNodes.length !== 2 || !newCardLabel.trim()}
          className={`btn-merge ${
            selectedNodes.length === 2 && newCardLabel.trim()
              ? "btn-merge-active"
              : "btn-merge-disabled"
          }`}
        >
          Ghép Card
        </button>
        <button onClick={handleReset} className="btn-merge">
          Reset sơ đồ
        </button>
      </div>

      {/* Flow Area */}
      <div className="flow-container">
        {isHydrated && (
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
        )}
      </div>
    </div>
  );
}
