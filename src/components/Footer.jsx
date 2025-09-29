import React from 'react';
import './Footer.css';

export default function Footer() {
    const year = new Date().getFullYear();
    return (
        <footer className="footer">
            <div className="footer__container">
                <div className="footer__content">
                    <div className="footer__brand">
                        <div className="footer__logo">
                            <div className="logo-icon">🃏</div>
                            <span className="logo-text">Arena of Cards</span>
                        </div>
                        <p className="footer__description">
                            Experience an amazing card game with stunning graphics and engaging gameplay.
                        </p>
                        <div className="footer__social">
                            <a href="#" className="social-link">📘</a>
                            <a href="#" className="social-link">🐦</a>
                            <a href="#" className="social-link">📷</a>
                            <a href="#" className="social-link">🎮</a>
                        </div>
                    </div>

                    <div className="footer__links">
                        <div className="footer__section">
                            <h4>Game</h4>
                            <ul>
                                <li><a href="#how-to-play">How to Play</a></li>
                                <li><a href="#cards">Cards</a></li>
                                <li><a href="#tournaments">Tournaments</a></li>
                                <li><a href="#leaderboard">Leaderboard</a></li>
                            </ul>
                        </div>

                        <div className="footer__section">
                            <h4>Support</h4>
                            <ul>
                                <li><a href="#help">Help</a></li>
                                <li><a href="#faq">FAQ</a></li>
                                <li><a href="#contact">Contact</a></li>
                                <li><a href="#bug-report">Bug Report</a></li>
                            </ul>
                        </div>

                        <div className="footer__section">
                            <h4>Legal</h4>
                            <ul>
                                <li><a href="#privacy">Privacy Policy</a></li>
                                <li><a href="#terms">Terms of Service</a></li>
                                <li><a href="#cookies">Cookie Policy</a></li>
                                <li><a href="#license">License</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="footer__bottom">
                    <div className="footer__copyright">
                        © {year} Arena of Cards. All rights reserved.
                    </div>
                    <div className="footer__badges">
                        <span className="badge">🎮 Free Game</span>
                        <span className="badge">🏆 Competitive</span>
                        <span className="badge">🃏 Card Game</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}


