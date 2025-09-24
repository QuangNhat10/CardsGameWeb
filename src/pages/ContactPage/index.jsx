import React from "react";
import Header from "../../components/Header.jsx";
import "./style.css";

export default function ContactPage() {
  return (
    <div className="contact-page">
      <Header />

      <div className="contact-container">
        <h1>Contact Us</h1>
        <p className="contact-subtitle">
          Please fill out the form below and we will get back to you as soon as
          possible.
        </p>

        <form className="contact-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              placeholder="Enter your message..."
              rows="5"
            ></textarea>
          </div>

          <button type="submit" className="submit-btn">
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
