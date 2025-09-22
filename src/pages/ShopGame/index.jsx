import "./styles.css";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useState } from "react";

const cards = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: `Card ${i + 1}`,
  price: (i + 1) * 50, // giá ví dụ: 50, 100, 150...
  type: ["attack", "defense", "magic", "special"][i % 4], // xoay vòng 4 loại
  rarity: ["common", "rare", "legendary"][i % 3], // xoay vòng 3 độ hiếm
  power: 40 + i * 10, // power tăng dần
  img: `/images/shop/Shop${i + 1}.jpg`,
  desc: `Description for card ${i + 1}`,
}));

export default function ShopPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [coins, setCoins] = useState(1000);
  const [owned, setOwned] = useState([]);

  const filtered = cards.filter(
    (c) =>
      (filter === "all" || c.type === filter) &&
      (c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.desc.toLowerCase().includes(search.toLowerCase()))
  );

  const handleBuy = (card) => {
    if (owned.includes(card.id)) {
      alert("Bạn đã mua thẻ này rồi!");
      return;
    }
    if (coins < card.price) {
      alert("Bạn không đủ xu!");
      return;
    }
    setCoins(coins - card.price);
    setOwned([...owned, card.id]);
  };

  return (
    <>
      <Header />

   {/* Shop title */}
  <h1 className="shop-title">Shop Card Magic</h1>

  {/* Coin bar */}
 <div className="coin-bar-wrapper">
  <div className="coin-bar">
    <span className="coin-icon">💰</span>
    Tổng tiền hiện có: {coins.toLocaleString()} Coins
  </div>
</div>


      {/* Bộ lọc + search */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search cards..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("attack")}>Attack</button>
        <button onClick={() => setFilter("defense")}>Defense</button>
        <button onClick={() => setFilter("magic")}>Magic</button>
        <button onClick={() => setFilter("special")}>Special</button>
      </div>

      {/* Danh sách thẻ */}
      <div className="card-list">
        {filtered.map((c) => (
          <div key={c.id} className="card-item">
            <img src={c.img} alt={c.name} />

            <div className="card-info">
              <span className={`badge ${c.rarity}`}>{c.rarity}</span>
              <div className="card-title">{c.name}</div>
              <div className="card-desc">{c.desc}</div>
              <div className="card-icons">
                <span>⚔ {c.power}</span>
              </div>
            </div>

            <div className="card-footer">
              <div className="card-price">💰 {c.price}</div>
              <button
                className="card-buy-btn"
                onClick={() => handleBuy(c)}
                disabled={owned.includes(c.id) || coins < c.price}
              >
                {owned.includes(c.id)
                  ? "Owned"
                  : coins < c.price
                  ? "Thiếu xu"
                  : "Buy"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <Footer />
    </>
  );
}
