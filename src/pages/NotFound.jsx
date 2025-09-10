import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import './NotFound.css';

export default function NotFound() {
    return (
        <>
            <Header />
            <main className="not-found">
                <div className="not-found__container">
                    <div className="not-found__content">
                        <div className="not-found__card">
                            <div className="card-icon">🃏</div>
                            <h1 className="not-found__title">404</h1>
                            <h2 className="not-found__subtitle">Card Not Found</h2>
                            <p className="not-found__description">
                                It seems the card you're looking for has been lost in another dimension. 
                                Return to the home page to continue your adventure!
                            </p>
                            <div className="not-found__actions">
                                <Link to="/" className="btn btn--primary">
                                    🏠 Back to Home
                                </Link>
                                <button className="btn btn--outline" onClick={() => window.history.back()}>
                                    ⬅️ Go Back
                                </button>
                            </div>
                        </div>
                        <div className="floating-cards">
                            <div className="floating-card">🃏</div>
                            <div className="floating-card">🃏</div>
                            <div className="floating-card">🃏</div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}


