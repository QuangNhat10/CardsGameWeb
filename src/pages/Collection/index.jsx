import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";
import MagicCard from "../../components/MagicCards.jsx";
import "./styles.css";

const CARD_TYPES = ["Common", "Uncommon", "Rare", "Mythic", "Legend"];
const rarityLevelFixed = {
  Common: 2,
  Uncommon: 4,
  Rare: 6,
  Mythic: 8,
  Legend: 10,
};

const initialCards = Array.from({ length: 20 }, (_, i) => {
  const rarity = CARD_TYPES[i % CARD_TYPES.length];
  return {
    id: i + 1,
    name: `Card ${i + 1}`,
    imageUrl: "https://placehold.co/300x200",
    typeLine: `${rarity} Creature`,
    stats: {
      atk: Math.floor(Math.random() * 10) + 1,
      def: Math.floor(Math.random() * 10) + 1,
    },
    abilities: [`Ability 1 for Card ${i + 1}`, `Ability 2 for Card ${i + 1}`],
    variant: ["monster", "spell", "trap"][i % 3],
    rarity,
    level: rarityLevelFixed[rarity],
  };
});

export default function Collection() {
  const [cards] = useState(initialCards);
  const [selectedCard, setSelectedCard] = useState(null);
  const [filterType, setFilterType] = useState("");
  const [sortAZ, setSortAZ] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // 🔹 Background scroll effect + Back to top toggle
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const percent = maxScroll > 0 ? scrolled / maxScroll : 0;
      document.querySelector(".page").style.backgroundPosition = `center ${
        percent * 100
      }%`;

      // Hiện nút back to top khi scroll > 200px
      setShowBackToTop(scrolled > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  let filteredCards = cards.filter((card) =>
    filterType ? card.rarity === filterType : true
  );
  if (sortAZ) {
    filteredCards = [...filteredCards].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }

  return (
    <div className="page">
      <Header />
      <div className="container">
        <h2 className="collection-title">
			Cards Collection
		</h2>
        <div
          className="collection-controls"
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            className="collection-sort-btn"
            onClick={() => setShowDropdown((v) => !v)}
          >
            <span>Sort & Filter</span>
          </div>
        </div>
        {showDropdown && (
          <div
            className="collection-sort-overlay"
            onClick={() => setShowDropdown(false)}
          >
            <div
              className="collection-sort-modal"
              style={{ zIndex: 201 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", marginBottom: 8 }}>
                  <input
                    type="checkbox"
                    checked={sortAZ}
                    onChange={() => setSortAZ((s) => !s)}
                  />{" "}
                  Sắp xếp tên A-Z
                </label>
                <label style={{ display: "block", marginBottom: 4 }}>
                  Lọc theo loại:
                </label>
                {CARD_TYPES.map((type) => (
                  <div key={type} style={{ marginBottom: 4 }}>
                    <label>
                      <input
                        type="radio"
                        name="filterType"
                        value={type}
                        checked={filterType === type}
                        onChange={(e) => setFilterType(e.target.value)}
                      />{" "}
                      {type}
                    </label>
                  </div>
                ))}
                <div style={{ marginTop: 8 }}>
                  <label>
                    <input
                      type="radio"
                      name="filterType"
                      value=""
                      checked={filterType === ""}
                      onChange={() => setFilterType("")}
                    />{" "}
                    All of Cards
                  </label>
                </div>
              </div>
              <div style={{ textAlign: "right", marginTop: 12 }}>
                <button
                  className="modal-close-btn"
                  onClick={() => setShowDropdown(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="collection-cards">
          {filteredCards.map((card) => (
            <div
              key={card.id}
              onClick={() => setSelectedCard(card)}
              className="collection-card"
            >
              <MagicCard
                name={card.name}
                imageUrl={card.imageUrl}
                typeLine={card.typeLine}
                stats={card.stats}
                abilities={card.abilities}
                variant={card.variant}
              />
              <div className="collection-card-level">Lv.{card.level}</div>
            </div>
          ))}
        </div>
      </div>
      {selectedCard && (
        <div
          className="collection-modal"
          onClick={() => setSelectedCard(null)}
        >
          <div
            className="collection-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <MagicCard
              name={selectedCard.name}
              imageUrl={selectedCard.imageUrl}
              typeLine={selectedCard.typeLine}
              stats={selectedCard.stats}
              abilities={selectedCard.abilities}
              variant={selectedCard.variant}
            />
            <div className="collection-modal-info">
              <strong>Loại:</strong> {selectedCard.rarity}
              <br />
              <strong>Cấp độ:</strong> Lv.{selectedCard.level}
            </div>
            <button
              className="collection-modal-close"
              onClick={() => setSelectedCard(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      <Footer />

      {/* 🔹 Back to Top Button */}
      <button
        className={`back-to-top ${showBackToTop ? "show" : "hide"}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <ArrowUp size={24} strokeWidth={2.5} color="#fff" />
      </button>
    </div>
  );
}
