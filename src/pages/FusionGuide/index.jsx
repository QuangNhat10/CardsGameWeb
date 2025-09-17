import React, { useState, useEffect } from "react";
import "./styles.css";

import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";
import MagicCard from "../../components/MagicCards.jsx";

const initialTree = [
  {
    name: "Thẻ Gốc 1",
    image: "/images/card1.jpg",
    stats: { dame: 90, defense: 70, type: "Vật Lý" },
    children: [],
  },
  {
    name: "Thẻ Gốc 2",
    image: "/images/card7.jpg",
    stats: { dame: 65, defense: 55, type: "Phép" },
    children: [],
  },
];

// =================== TreeNode Component ===================
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

// =================== Helpers ===================
function flattenCards(nodes) {
  let result = [];
  for (let node of nodes) {
    result.push(node);
    if (node.children) {
      result = result.concat(flattenCards(node.children));
    }
  }
  return result;
}

function deleteCardFromTree(nodes, cardName) {
  let result = [];
  for (let node of nodes) {
    if (node.name === cardName) {
      if (node.children && node.children.length > 0) {
        result = result.concat(deleteCardFromTree(node.children, cardName));
      }
    } else {
      let newNode = { ...node };
      if (newNode.children) {
        newNode.children = deleteCardFromTree(newNode.children, cardName);
      }
      result.push(newNode);
    }
  }
  return result;
}

// =================== Main Component ===================
export default function Index() {
  // lấy dữ liệu từ localStorage, nếu chưa có thì dùng initialTree
  const [treeData, setTreeData] = useState(() => {
    const saved = localStorage.getItem("treeData");
    return saved ? JSON.parse(saved) : initialTree;
  });

  const [selectedCard, setSelectedCard] = useState(null);

  // modal thêm card
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCard, setNewCard] = useState({
    name: "",
    image: "",
    dame: 40,
    defense: 30,
    type: "Vật Lý",
    parent: "root1",
  });

  // modal ghép card
  const [showFusionModal, setShowFusionModal] = useState(false);
  const [fusion1, setFusion1] = useState("");
  const [fusion2, setFusion2] = useState("");
  const [fusionError, setFusionError] = useState(""); // thêm state lỗi

  // modal xoá card
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const allCards = flattenCards(treeData);

  // lưu vào localStorage mỗi khi treeData thay đổi
  useEffect(() => {
    localStorage.setItem("treeData", JSON.stringify(treeData));
  }, [treeData]);

  // thêm card mới vào cây
  const handleAddCard = () => {
    const cardObj = {
      name: newCard.name || "Card Mới",
      image: newCard.image || null,
      stats: {
        dame: parseInt(newCard.dame),
        defense: parseInt(newCard.defense),
        type: newCard.type,
      },
      children: [],
    };

    let newTree = [...treeData];
    if (newCard.parent === "root1") {
      newTree[0].children.push(cardObj);
    } else if (newCard.parent === "root2") {
      newTree[1].children.push(cardObj);
    } else {
      newTree.push(cardObj); // tạo thẻ gốc mới
    }

    setTreeData(newTree);
    setShowAddModal(false);
    setNewCard({
      name: "",
      image: "",
      dame: 40,
      defense: 30,
      type: "Vật Lý",
      parent: "root1",
    });
  };

  // xử lý ghép card
  const handleFusion = () => {
    if (!fusion1 || !fusion2) {
      setFusionError("❌ Vui lòng chọn đủ 2 thẻ!");
      return;
    }
    if (fusion1 === fusion2) {
      setFusionError("⚠️ Không thể ghép cùng 1 thẻ!");
      return;
    }

    const card1 = allCards.find((c) => c.name === fusion1);
    const card2 = allCards.find((c) => c.name === fusion2);

    if (!card1 || !card2) {
      setFusionError("❌ Thẻ không tồn tại!");
      return;
    }

    // ghép thành công
    const newFusion = {
      name: `Fusion(${card1.name}+${card2.name})`,
      image: null,
      stats: {
        dame: Math.floor((card1.stats.dame + card2.stats.dame) / 2) + 20,
        defense:
          Math.floor((card1.stats.defense + card2.stats.defense) / 2) + 10,
        type: "Fusion",
      },
      children: [card1, card2],
    };

    const newTree = [...treeData];
    newTree[0].children.push(newFusion);
    setTreeData(newTree);

    // reset state
    setFusion1("");
    setFusion2("");
    setFusionError(""); // xoá lỗi nếu có
    setShowFusionModal(false);
  };

  // xử lý xoá card
  const handleDeleteCard = (cardName) => {
    const newTree = deleteCardFromTree(treeData, cardName);
    setTreeData(newTree);
    setShowDeleteModal(false);
    setSelectedCard(null);
  };

  return (
    <div className="page">
      <Header />
      <div className="container">
        <div className="controls">
          <button onClick={() => setShowAddModal(true)}>➕ Thêm Card</button>
          <button onClick={() => setShowFusionModal(true)}>⚡ Ghép Card</button>
          <button onClick={() => setShowDeleteModal(true)}>🗑️ Xóa Card</button>
        </div>
        <div className="tree">
          {treeData.map((root, idx) => (
            <TreeNode key={idx} node={root} onSelect={setSelectedCard} />
          ))}
        </div>
      </div>

      {/* modal chi tiết card */}
      {selectedCard && (
        <div className="modal" onClick={() => setSelectedCard(null)}>
          <div
            className="card-detail-rectangle"
            onClick={(e) => e.stopPropagation()}
          >
            <MagicCard
              name={selectedCard.name}
              imageUrl={selectedCard.image || "https://placehold.co/300x200"}
              typeLine={
                selectedCard.stats ? `Loại: ${selectedCard.stats.type}` : ""
              }
              stats={{
                atk: selectedCard.stats?.dame || 0,
                def: selectedCard.stats?.defense || 0,
              }}
              abilities={
                selectedCard.stats
                  ? [
                      `Dame: ${selectedCard.stats.dame}`,
                      `Chống chịu: ${selectedCard.stats.defense}`,
                      `Loại: ${selectedCard.stats.type}`,
                    ]
                  : []
              }
              variant={
                selectedCard.stats?.type === "Phép"
                  ? "spell"
                  : selectedCard.stats?.type === "Hỗ Trợ"
                  ? "trap"
                  : "monster"
              }
            />
            <button
              style={{ marginTop: 12 }}
              onClick={() => setSelectedCard(null)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* modal thêm card */}
      {showAddModal && (
        <div className="modal" onClick={() => setShowAddModal(false)}>
          <div className="fusion-modal" onClick={(e) => e.stopPropagation()}>
            <h3>➕ Thêm Card Mới</h3>
            <input
              type="text"
              placeholder="Tên card"
              value={newCard.name}
              onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Link ảnh"
              value={newCard.image}
              onChange={(e) =>
                setNewCard({ ...newCard, image: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Dame"
              value={newCard.dame}
              onChange={(e) => setNewCard({ ...newCard, dame: e.target.value })}
            />
            <input
              type="number"
              placeholder="Defense"
              value={newCard.defense}
              onChange={(e) =>
                setNewCard({ ...newCard, defense: e.target.value })
              }
            />
            <select
              value={newCard.type}
              onChange={(e) => setNewCard({ ...newCard, type: e.target.value })}
            >
              <option value="Vật Lý">Vật Lý</option>
              <option value="Phép">Phép</option>
              <option value="Hỗ Trợ">Hỗ Trợ</option>
            </select>
            <select
              value={newCard.parent}
              onChange={(e) =>
                setNewCard({ ...newCard, parent: e.target.value })
              }
            >
              <option value="root1">Thêm vào Thẻ Gốc 1</option>
              <option value="root2">Thêm vào Thẻ Gốc 2</option>
              <option value="new">Tạo thẻ gốc mới</option>
            </select>
            <button onClick={handleAddCard}>Thêm</button>
          </div>
        </div>
      )}

      {/* modal fusion */}
      {showFusionModal && (
        <div className="modal" onClick={() => setShowFusionModal(false)}>
          <div className="fusion-modal" onClick={(e) => e.stopPropagation()}>
            <h3>⚡ Ghép 2 Card</h3>
            <select
              value={fusion1}
              onChange={(e) => setFusion1(e.target.value)}
            >
              <option value="">-- Chọn card 1 --</option>
              {allCards.map((c, i) => (
                <option key={i} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={fusion2}
              onChange={(e) => setFusion2(e.target.value)}
            >
              <option value="">-- Chọn card 2 --</option>
              {allCards.map((c, i) => (
                <option key={i} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            {fusionError && (
              <p style={{ color: "red", marginTop: 8 }}>{fusionError}</p>
            )}

            <button onClick={handleFusion}>Ghép lại</button>
          </div>
        </div>
      )}

      {/* modal delete */}
      {showDeleteModal && (
        <div className="modal" onClick={() => setShowDeleteModal(false)}>
          <div className="fusion-modal" onClick={(e) => e.stopPropagation()}>
            <h3>🗑️ Xóa Card</h3>
            <select
              onChange={(e) => handleDeleteCard(e.target.value)}
              defaultValue=""
            >
              <option value="">-- Chọn card cần xóa --</option>
              {allCards.map((c, i) => (
                <option key={i} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
