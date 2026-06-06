import React from 'react';
import { Link } from 'react-router-dom';

const GitHubIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M12 .5a11.5 11.5 0 00-3.64 22.43c.58.11.79-.25.79-.56v-2.02c-3.22.7-3.9-1.55-3.9-1.55-.53-1.36-1.3-1.72-1.3-1.72-1.06-.72.08-.7.08-.7 1.17.08 1.79 1.2 1.79 1.2 1.04 1.77 2.73 1.26 3.4.96.11-.75.41-1.26.75-1.55-2.57-.29-5.27-1.29-5.27-5.73 0-1.27.45-2.31 1.18-3.13-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.2.92-.26 1.9-.39 2.88-.39.98 0 1.96.13 2.88.39 2.2-1.51 3.17-1.2 3.17-1.2.62 1.58.23 2.75.11 3.04.73.82 1.18 1.86 1.18 3.13 0 4.45-2.7 5.43-5.28 5.72.42.37.79 1.1.79 2.22v3.29c0 .31.2.68.8.56A11.5 11.5 0 0012 .5z" />
  </svg>
);

const TwitterIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M23 4.01c-.8.36-1.66.6-2.56.71a4.48 4.48 0 00-7.64 3.07v.38A12.72 12.72 0 013 3.15a4.48 4.48 0 001.39 5.98c-.66-.02-1.28-.2-1.82-.5v.05c0 1.68 1.2 3.09 2.79 3.42-.52.14-1.07.17-1.63.06.46 1.43 1.78 2.47 3.34 2.5A9.02 9.02 0 012 19.54a12.73 12.73 0 006.88 2.01c8.26 0 12.78-6.85 12.78-12.79v-.58A9.1 9.1 0 0023 4.01z" />
  </svg>
);

const LinkedInIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.5 8h4V24h-4zM8.5 8h3.6v2.2h.1c.5-.9 1.9-1.9 3.8-1.9 4.1 0 4.9 2.6 4.9 6V24h-4v-7.4c0-1.8 0-4.1-2.5-4.1-2.5 0-2.9 1.9-2.9 4V24h-4z" />
  </svg>
);

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-col footer-brand">
          <Link to="/" className="brand-link">
            <span className="brand-pill">FinanceAI</span>
          </Link>
          <p className="footer-desc">AI-driven personal finance platform — insights, budgeting, and secure money management for individuals and teams.</p>

          <div className="footer-socials">
            <a href="#" aria-label="GitHub" className="social-link"><GitHubIcon /></a>
            <a href="#" aria-label="Twitter" className="social-link"><TwitterIcon /></a>
            <a href="#" aria-label="LinkedIn" className="social-link"><LinkedInIcon /></a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Product</h4>
          <ul className="footer-links">
            <li><Link to="/features">Features</Link></li>
            <li><Link to="/pricing">Pricing</Link></li>
            <li><Link to="/ai">AI Advisor</Link></li>
            <li><Link to="/integrations">Integrations</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Company</h4>
          <ul className="footer-links">
            <li><Link to="/about">About</Link></li>
            <li><Link to="/careers">Careers</Link></li>
            <li><Link to="/press">Press</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className="footer-col footer-newsletter">
          <h4>Stay informed</h4>
          <p className="small muted">Get product updates and actionable finance tips.</p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="name@company.com" aria-label="Email address" />
            <button className="btn-subscribe" type="submit">Subscribe</button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-copyright">© {year} FinanceAI. All rights reserved.</div>
        <nav className="footer-legal">
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </nav>
      </div>
    </footer>
  );
}
