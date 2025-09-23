import React, { useRef, useState } from "react";
import "./Header.css";
import { Link } from "react-router-dom";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const featuresRef = useRef(null);
  const gameModesRef = useRef(null);

  const open = (ref) => {
    if (!ref?.current) return;
    clearTimeout(ref.current._t);
    ref.current.classList.add("is-open");
  };
  const closeWithDelay = (ref) => {
    if (!ref?.current) return;
    clearTimeout(ref.current._t);
    ref.current._t = setTimeout(() => {
      ref.current && ref.current.classList.remove("is-open");
    }, 200);
  };
  const toggleOpenClick = (ref, e) => {
    if (!ref?.current) return;
    e.preventDefault();
    clearTimeout(ref.current._t);
    const isOpen = ref.current.classList.contains("is-open");
    if (isOpen) {
      ref.current.classList.remove("is-open");
    } else {
      ref.current.classList.add("is-open");
    }
  };

  return (
    <header className="header">
      {/* Main nav bar */}
      <div className="header__main">
        <div className="header__container">
          <div className="header__logo">
            <div className="logo-icon">🃏</div>
            <span className="logo-text">Arena of Cards</span>
          </div>

          <nav className={`nav ${isMenuOpen ? "nav--open" : ""}`}>
            <a href="/" className="nav__link">
              Home
            </a>

            <div
              className="nav-item"
              ref={featuresRef}
              onMouseEnter={() => open(featuresRef)}
              onMouseLeave={() => closeWithDelay(featuresRef)}
            >
              <a
                href="#features"
                onClick={(e) => toggleOpenClick(featuresRef, e)}
                className="nav__link"
              >
                Cards
                <span className="nav__arrow">▼</span>
              </a>
              <div className="dropdown">
                <div className="dropdown__content">
                  <div className="dropdown__section">
                    <h4>New Sets</h4>
                    <a
                      href="/cards/edge-of-eternities"
                      className="dropdown__item"
                    >
                      <div
                        className="dropdown__item-image"
                        style={{
                          backgroundImage: "url(/images/cardfeature1.jpg)",
                        }}
                      ></div>
                      <div className="dropdown__item-text">
                        <span className="dropdown__item-title">
                          Edge of Eternities
                        </span>
                        <span className="dropdown__item-desc">
                          Cosmic battles await
                        </span>
                      </div>
                    </a>
                    <a href="/cards/final-fantasy" className="dropdown__item">
                      <div
                        className="dropdown__item-image"
                        style={{
                          backgroundImage: "url(/images/cardfeature2.jpg)",
                        }}
                      ></div>
                      <div className="dropdown__item-text">
                        <span className="dropdown__item-title">
                          Final Fantasy Crossover
                        </span>
                        <span className="dropdown__item-desc">
                          Iconic heroes unite
                        </span>
                      </div>
                    </a>
                    <a href="/cards/tarkir" className="dropdown__item">
                      <div
                        className="dropdown__item-image"
                        style={{
                          backgroundImage: "url(/images/cardfeature3.jpg)",
                        }}
                      ></div>
                      <div className="dropdown__item-text">
                        <span className="dropdown__item-title">
                          Tarkir: Dragonstorm
                        </span>
                        <span className="dropdown__item-desc">
                          Ancient dragons rise
                        </span>
                      </div>
                    </a>
                  </div>
                  <div className="dropdown__section">
                    <h4>Core Sets</h4>
                    <a href="/cards/foundations" className="dropdown__item">
                      <div
                        className="dropdown__item-image"
                        style={{
                          backgroundImage: "url(/images/cardfeature4.jpg)",
                        }}
                      ></div>
                      <div className="dropdown__item-text">
                        <span className="dropdown__item-title">
                          Foundations
                        </span>
                        <span className="dropdown__item-desc">
                          Master the basics
                        </span>
                      </div>
                    </a>
                    <a href="/cards/classic" className="dropdown__item">
                      <div
                        className="dropdown__item-image"
                        style={{ backgroundImage: "url(/images/map1.jpg)" }}
                      ></div>
                      <div className="dropdown__item-text">
                        <span className="dropdown__item-title">
                          Classic Collection
                        </span>
                        <span className="dropdown__item-desc">
                          Timeless favorites
                        </span>
                      </div>
                    </a>
                    <a href="/cards/limited" className="dropdown__item">
                      <div
                        className="dropdown__item-image"
                        style={{ backgroundImage: "url(/images/map2.jpg)" }}
                      ></div>
                      <div className="dropdown__item-text">
                        <span className="dropdown__item-title">
                          Limited Edition
                        </span>
                        <span className="dropdown__item-desc">
                          Exclusive cards
                        </span>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="nav-item"
              ref={gameModesRef}
              onMouseEnter={() => open(gameModesRef)}
              onMouseLeave={() => closeWithDelay(gameModesRef)}
            >
              <a
                href="#game-modes"
                onClick={(e) => toggleOpenClick(gameModesRef, e)}
                className="nav__link"
              >
                Game Modes
                <span className="nav__arrow">▼</span>
              </a>
              <div className="dropdown">
                <div className="dropdown__content">
                  <div className="dropdown__section">
                    <h4>PvP</h4>
                    <a href="/modes/ranked" className="dropdown__item">
                      <div
                        className="dropdown__item-image"
                        style={{ backgroundImage: "url(/images/map3.jpg)" }}
                      ></div>
                      <div className="dropdown__item-text">
                        <span className="dropdown__item-title">Ranked</span>
                        <span className="dropdown__item-desc">
                          Climb the ladder
                        </span>
                      </div>
                    </a>
                    <a href="/modes/casual" className="dropdown__item">
                      <div
                        className="dropdown__item-image"
                        style={{ backgroundImage: "url(/images/map4.jpg)" }}
                      ></div>
                      <div className="dropdown__item-text">
                        <span className="dropdown__item-title">Casual</span>
                        <span className="dropdown__item-desc">
                          Relaxed matches
                        </span>
                      </div>
                    </a>
                    <a href="/modes/tournament" className="dropdown__item">
                      <div
                        className="dropdown__item-image"
                        style={{
                          backgroundImage: "url(/images/chienthuat1.jpg)",
                        }}
                      ></div>
                      <div className="dropdown__item-text">
                        <span className="dropdown__item-title">Tournament</span>
                        <span className="dropdown__item-desc">
                          Compete for glory
                        </span>
                      </div>
                    </a>
                  </div>
                  <div className="dropdown__section">
                    <h4>PvE</h4>
                    <a href="/modes/campaign" className="dropdown__item">
                      <div
                        className="dropdown__item-image"
                        style={{
                          backgroundImage: "url(/images/chienthuat2.jpg)",
                        }}
                      ></div>
                      <div className="dropdown__item-text">
                        <span className="dropdown__item-title">Campaign</span>
                        <span className="dropdown__item-desc">
                          Epic story mode
                        </span>
                      </div>
                    </a>
                    <a href="/modes/dungeon" className="dropdown__item">
                      <div
                        className="dropdown__item-image"
                        style={{
                          backgroundImage: "url(/images/chienthuat3.jpg)",
                        }}
                      ></div>
                      <div className="dropdown__item-text">
                        <span className="dropdown__item-title">Dungeon</span>
                        <span className="dropdown__item-desc">
                          Explore depths
                        </span>
                      </div>
                    </a>
                    <a href="/modes/boss" className="dropdown__item">
                      <div
                        className="dropdown__item-image"
                        style={{ backgroundImage: "url(/images/anhnen.jpg)" }}
                      ></div>
                      <div className="dropdown__item-text">
                        <span className="dropdown__item-title">Boss Raid</span>
                        <span className="dropdown__item-desc">
                          Face mighty foes
                        </span>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <a href="/collection" className="nav__link">
              Collection
            </a>
            <Link to="/shop-game" className="nav__link">
              Shop
            </Link>
            <a href="/fusion-guide" className="nav__link">
              Fusion Guide
            </a>
            <a href="/contact" className="nav__link">
              Contact
            </a>
          </nav>

          <div className="header__actions">
            <button className="btn btn--outline">Login</button>
            <button className="btn btn--primary">Play Now</button>
            <button
              className="header__menu-toggle"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
