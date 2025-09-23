import React, { useState, useEffect } from "react";
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
import Header from "../../components/Header";
import { io } from "socket.io-client";

// Ảnh placeholder cho card
const cardImg =
  "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg";

// Dữ liệu mặc định
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

// ====== Component Node (Card) ======
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

// ====== Main Component ======
export default function Reviews() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    const socket = io("http://localhost:3001"); // đổi thành server thật của bạn

    // 🔹 Thêm card mới
    socket.on("addCard", () => {
      const newId = (nodes.length + 1).toString();
      const newX = 50 + Math.random() * 500;
      const newY = 50 + Math.random() * 300;

      setNodes((nds) => [
        ...nds,
        {
          id: newId,
          type: "cardNode",
          position: { x: newX, y: newY },
          data: {
            label: `Auto-${newId}`,
            img: cardImg,
            description: `This is auto-generated card ${newId}.`,
            power: Math.floor(Math.random() * 100),
            rarity: "Common",
          },
        },
      ]);
    });

    // 🔹 Ghép 2 card cuối cùng
    socket.on("mergeCard", () => {
      if (nodes.length < 2) return;

      const [nodeA, nodeB] = nodes.slice(-2); // lấy 2 node cuối
      const newId = (nodes.length + 1).toString();
      const newX = (nodeA.position.x + nodeB.position.x) / 2;
      const newY = Math.max(nodeA.position.y, nodeB.position.y) + 150;

      setNodes((nds) => [
        ...nds,
        {
          id: newId,
          type: "cardNode",
          position: { x: newX, y: newY },
          data: {
            label: `Fusion-${newId}`,
            img: cardImg,
            description: `Merged from ${nodeA.data.label} and ${nodeB.data.label}.`,
            power: Math.floor(
              ((nodeA.data.power ?? 50) + (nodeB.data.power ?? 50)) / 2
            ),
            rarity: "Fusion",
          },
        },
      ]);

      setEdges((eds) => [
        ...eds,
        {
          id: `e${nodeA.id}-${newId}`,
          source: nodeA.id,
          target: newId,
          type: "step",
          style: { stroke: "#fff", strokeWidth: 3 },
        },
        {
          id: `e${nodeB.id}-${newId}`,
          source: nodeB.id,
          target: newId,
          type: "step",
          style: { stroke: "#fff", strokeWidth: 3 },
        },
      ]);
    });

    // 🔹 Reset sơ đồ
    socket.on("resetFlow", () => {
      setNodes(initialNodes);
      setEdges(initialEdges);
    });

    return () => {
      socket.disconnect();
    };
  }, [nodes, edges]);

  return (
    <div className="reviews-page">
      <Header />

      {/* Flow Area */}
      <div className="flow-container">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background color="#aaa" gap={32} />
          <MiniMap />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
