import React from "react";
import { Link } from "react-router-dom";

import "./styles.css";
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";

const featureCards = [
  {
    id: "griffin-guardian",
    title: "Griffin Guardian",
    description:
      "Half lion, half eagle — a symbol of courage and vision. Grants aerial retaliation and powerful protection.",
    imageUrl: "/images/cardfeature1.jpg",
    backgroundPosition: "center 15%",
    rarity: "legendary",
  },
  {
    id: "werewolf-hunter",
    title: "Alpha Werewolf",
    description:
      "A moonlit berserker whose strength surges at night. Applies relentless pressure as the battle drags on.",
    imageUrl: "/images/cardfeature2.jpg",
    backgroundPosition: "center 35%",
    rarity: "epic",
  },
  {
    id: "chimera-drake",
    title: "Chimera Drake",
    description:
      "A fusion of dragon, lion, and beast with blazing wings. Versatile—bursts damage while controlling the field.",
    imageUrl: "/images/cardfeature3.jpg",
    backgroundPosition: "center 35%",
    rarity: "epic",
  },
  {
    id: "pegasus-unicorn",
    title: "Pegasus Unicorn",
    description:
      "A winged holy beast that blesses allies with healing and speed. Perfect for outmaneuvering fights.",
    imageUrl: "/images/cardfeature4.jpg",
    rarity: "rare",
  },
];

const mapCards = [
  {
    id: "map-1",
    title: "Shadow Forest",
    imageUrl: "/images/map1.jpg",
    description: "A misty woodland where vision is scarce and ambush rules.",
    rarity: "rare",
  },
  {
    id: "map-2",
    title: "Crystal Caverns",
    imageUrl: "/images/map2.jpg",
    description:
      "Echoing tunnels and mana-rich crystals power explosive turns.",
    rarity: "epic",
  },
  {
    id: "map-3",
    title: "Ember Dunes",
    imageUrl: "/images/map3.jpg",
    description: "Scorching sands reward swift, aggressive strategies.",
    rarity: "rare",
  },
  {
    id: "map-4",
    title: "Frozen Citadel",
    imageUrl: "/images/map4.jpg",
    description: "Icy battlements favor control and long-game plans.",
    rarity: "legendary",
  },
];

export default function Home() {
  return (
    <>
      <Header />
      <main className="home">
        {/* Hero */}
        <section className="home__hero">
          <div className="home__hero-content">
            <h1 className="home__title">Arena of Cards</h1>
            <p className="home__subtitle">
              Learn the basics, perfect your strategy, and compete in a
              fast-paced trading card game. Download free and enter the Arena.
            </p>
            <div className="home__cta-row">
              <button className="home__cta primary">🎮 Download</button>
              <button className="home__cta ghost">🃏 Choose Your Deck</button>
              <Link to="/login" className="home__cta ghost">
                🔐 Login
              </Link>
            </div>
          </div>
          <div className="floating-card-2">🃏</div>
          <div className="floating-card-3">🃏</div>
        </section>

        {/* Featured */}
        <h2 className="home__section-title">Featured Card Sets</h2>
        <section className="home__grid">
          {featureCards.map((card) => (
            <article
              key={card.id}
              className="feature-card"
              data-rarity={card.rarity}
            >
              <div
                className="feature-card__image"
                style={{
                  backgroundImage: `url(${card.imageUrl})`,
                  backgroundPosition: card.backgroundPosition || "center",
                }}
              />
              <div className="feature-card__body">
                <h3 className="feature-card__title">{card.title}</h3>
                <p className="feature-card__description">{card.description}</p>
              </div>
            </article>
          ))}
        </section>

        {/* Strategies */}
        <h2 className="home__section-title">Popular Strategies</h2>
        <section className="highlights">
          <div className="highlights__grid">
            <article className="highlight">
              <div
                className="highlight__image"
                style={{ backgroundImage: "url(/images/chienthuat1.jpg)" }}
              />
              <div className="highlight__body">
                <h3 className="highlight__title">
                  A Strategy Game Unlike Any Other
                </h3>
                <ul className="highlight__list">
                  <li>The TCG experience on phone and PC</li>
                  <li>Collect, build and master your unique deck</li>
                  <li>Show off with avatars, sleeves and companions</li>
                  <li>One shared account across devices</li>
                </ul>
              </div>
            </article>

            <article className="highlight">
              <div
                className="highlight__image"
                style={{ backgroundImage: "url(/images/chienthuat2.jpg)" }}
              />
              <div className="highlight__body">
                <h3 className="highlight__title">New To Magic? No Problem</h3>
                <ul className="highlight__list">
                  <li>Complete the tutorial to learn the basics</li>
                  <li>Unlock starter decks through Color Challenge</li>
                  <li>Compete against newcomers in Starter Deck Duels</li>
                  <li>Define your own strategy and build a deck</li>
                </ul>
              </div>
            </article>

            <article className="highlight">
              <div
                className="highlight__image"
                style={{ backgroundImage: "url(/images/chienthuat3.jpg)" }}
              />
              <div className="highlight__body">
                <h3 className="highlight__title">Rise The Ranks</h3>
                <ul className="highlight__list">
                  <li>Compete in ranked PvP and tournaments</li>
                  <li>Earn daily rewards and grow your collection</li>
                  <li>Join events including Drafts and Midweek Magic</li>
                  <li>Climb leaderboards and prove your skill</li>
                </ul>
              </div>
            </article>
          </div>
        </section>

        {/* Maps */}
        <h2 className="home__section-title">Available Maps</h2>
        <section className="home__grid">
          {mapCards.map((card) => (
            <article
              key={card.id}
              className="feature-card"
              data-rarity={card.rarity}
            >
              <div
                className="feature-card__image"
                style={{ backgroundImage: `url(${card.imageUrl})` }}
              />
              <div className="feature-card__body">
                <h3 className="feature-card__title">{card.title}</h3>
                <p className="feature-card__description">{card.description}</p>
              </div>
            </article>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}
