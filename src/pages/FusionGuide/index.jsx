import React, { useState } from "react";
import "./styles.css";
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";

const treeData = [
    {
      name: "Thẻ Gốc 1",
      image: "/images/card1.jpg",
      stats: { dame: 90, defense: 70, type: "Vật Lý" },
      children: [
        {
          name: "Nhánh A",
          image: "/images/card2.jpg",
          stats: { dame: 60, defense: 40, type: "Phép" },
          children: [
            { 
              name: "A1", 
              image: "/images/card3.jpg", 
              stats: { dame: 75, defense: 50, type: "Hỗ Trợ" },
              children: [
                { name: "A1-1", image: null, stats: { dame: 30, defense: 20, type: "Vật Lý" } },
                { name: "A1-2", image: "/images/card4.jpg", stats: { dame: 45, defense: 25, type: "Phép" } },
                { name: "A1-3", image: null, stats: { dame: 20, defense: 15, type: "Hỗ Trợ" } },
              ]
            },
            { 
              name: "A2", 
              image: null, 
              stats: { dame: 40, defense: 30, type: "Vật Lý" },
              children: [
                { name: "A2-1", image: "/images/card5.jpg", stats: { dame: 35, defense: 18, type: "Vật Lý" } },
                { name: "A2-2", image: null, stats: { dame: 25, defense: 12, type: "Phép" } },
              ]
            },
          ],
        },
        {
          name: "Nhánh B",
          image: null,
          stats: { dame: 55, defense: 45, type: "Hỗ Trợ" },
          children: [
            { name: "B1", image: "/images/card6.jpg", stats: { dame: 50, defense: 40, type: "Vật Lý" } },
            { name: "B2", image: null, stats: { dame: 28, defense: 22, type: "Phép" } },
            { name: "B3", image: "/images/card7.jpg", stats: { dame: 33, defense: 17, type: "Hỗ Trợ" } },
          ]
        },
      ],
    },
    {
      name: "Thẻ Gốc 2",
      image: "/images/card7.jpg",
      stats: { dame: 65, defense: 55, type: "Phép" },
      children: [
        {
          name: "Nhánh C",
          image: "/images/card8.jpg",
          stats: { dame: 45, defense: 25, type: "Vật Lý" },
          children: [
            { name: "C1", image: null, stats: { dame: 22, defense: 12, type: "Hỗ Trợ" } },
            { name: "C2", image: "/images/card9.jpg", stats: { dame: 37, defense: 20, type: "Phép" } },
          ]
        },
        {
          name: "Nhánh D",
          image: null,
          stats: { dame: 35, defense: 15, type: "Hỗ Trợ" },
          children: [
            { name: "D1", image: null, stats: { dame: 18, defense: 10, type: "Vật Lý" } },
            { name: "D2", image: "/images/card10.jpg", stats: { dame: 27, defense: 14, type: "Phép" } },
            { name: "D3", image: null, stats: { dame: 21, defense: 9, type: "Hỗ Trợ" } },
          ]
        },
      ],
    },
  ];
  

function TreeNode({ node, onSelect }) {
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className={`tree-node ${hasChildren ? "has-children" : ""}`}>
      <div className="card" onClick={() => onSelect(node)}>
        <div className="card-img-wrapper">
          {node.image ? (
            <img src={node.image} alt={node.name} className="card-img" />
          ) : (
            <div className="card-img placeholder">No Img</div>
          )}
        </div>
        <span className="card-name">{node.name}</span>
      </div>

      {hasChildren && (
        <div className="children-row">
          {node.children.map((child, i) => (
            <TreeNode key={i} node={child} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Index() {
  const [selectedCard, setSelectedCard] = useState(null);

  return (
    <div className="page">
      <Header />
      <div className="container">
        <div className="tree">
          {/* Render nhiều root song song */}
          {treeData.map((root, idx) => (
            <TreeNode key={idx} node={root} onSelect={setSelectedCard} />
          ))}
        </div>
      </div>

      {selectedCard && (
        <div className="modal" onClick={() => setSelectedCard(null)}>
          <div
            className="card-detail-rectangle"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-detail-rectangle-img">
              {selectedCard.image ? (
                <img src={selectedCard.image} alt={selectedCard.name} />
              ) : (
                <div className="no-img-large">No Image</div>
              )}
            </div>
            <div className="card-detail-rectangle-info">
              <h2>{selectedCard.name}</h2>
              {selectedCard.stats && (
                <>
                  <p><strong>Dame:</strong> {selectedCard.stats.dame}</p>
                  <p><strong>Chống chịu:</strong> {selectedCard.stats.defense}</p>
                  <p><strong>Loại:</strong> {selectedCard.stats.type}</p>
                </>
              )}
              <button onClick={() => setSelectedCard(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
