import { Link, useNavigate } from 'react-router-dom';
import '../styles/pages/LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();

  const handleBrowseCatalogue = () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      navigate('/catalogue');
      return;
    }
    navigate('/auth');
  };

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-brand">
          <img src="/vite.svg" alt="BidSphere logo" className="brand-mark" />
          <p>
            Bid<span>Sphere</span>
          </p>
        </div>

        <nav className="landing-nav" aria-label="Primary">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#showcase">Catalogue</a>
        </nav>

        <div className="landing-auth">
          <Link to="/auth" className="ghost-link">
            Log in
          </Link>
          <Link to="/auth?mode=signup" className="primary-link">
            Join the auctions
          </Link>
        </div>
      </header>

      <main className="landing-main">
        <section className="landing-hero">
          <div className="hero-text">
            <p className="hero-eyebrow">Auction platform for EECS4413</p>
            <h1>Browse active listings and bid in real time.</h1>
            <p className="hero-body">
              Sign in with OAuth, explore the connected catalogue, and place bids backed by our
              Spring Boot + React stack. No fluff—just the core experience we ship in this repo.
            </p>
            <div className="hero-cta">
              <button type="button" className="primary-link" onClick={handleBrowseCatalogue}>
                Browse catalogue
              </button>
            </div>
          </div>
          <div className="hero-highlights" aria-label="Key platform features">
            <p className="highlights-eyebrow">What you'll use</p>
            <ul>
              <li>
                <strong>Live search</strong>
                <span>Filter by keyword, status, and price directly from the backend search API.</span>
              </li>
              <li>
                <strong>Secure sign-in</strong>
                <span>OAuth2 login hands back JWTs for every browsing session.</span>
              </li>
              <li>
                <strong>Realtime bidding</strong>
                <span>WebSocket updates keep auction cards fresh while you watch.</span>
              </li>
            </ul>
          </div>
        </section>

        <section id="features" className="landing-features">
          <header>
            <p className="section-eyebrow">Platform features</p>
            <h2>Everything on this page ships in the repo.</h2>
          </header>
          <div className="feature-grid">
            <article>
              <h3>Connected catalogue</h3>
              <p>
                React + Vite front-end calls the Spring Boot search endpoint for live filters,
                pagination, and item summaries.
              </p>
            </article>
            <article>
              <h3>OAuth2 sign-in</h3>
              <p>
                Google login + custom success handlers issue JWTs that gate the bidding surfaces.
              </p>
            </article>
            <article>
              <h3>Live bidding flow</h3>
              <p>
                Bid forms post straight to the backend service which validates, saves, and broadcasts
                updates over WebSockets.
              </p>
            </article>
          </div>
        </section>

        <section id="how-it-works" className="landing-timeline">
          <header>
            <p className="section-eyebrow">How it works</p>
            <h2>What happens when you land here.</h2>
          </header>
          <ol>
            <li>
              <span>01</span>
              <div>
                <h3>Sign in with Google</h3>
                <p>OAuth2 drops you back here with a JWT so every request stays authenticated.</p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <h3>Search the catalogue</h3>
                <p>
                  Use the filters we built—keywords, status, and price—to find the auctions you care
                  about.
                </p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <h3>Place your bid</h3>
                <p>
                  Submit bids straight to the Spring service and watch the cards update through the
                  WebSocket feed.
                </p>
              </div>
            </li>
          </ol>
        </section>

        <section id="showcase" className="landing-showcase">
          <header>
            <p className="section-eyebrow">Get hands-on</p>
            <h2>The current build ships with these flows.</h2>
          </header>
          <div className="showcase-grid">
            <article>
              <h3>Catalogue view</h3>
              <p>
                Grid layout powered by the `/auction/search` endpoint with pagination, sorting, and
                saved filters.
              </p>
              <Link to="/catalogue">Open catalogue</Link>
            </article>
            <article>
              <h3>Bidding surface</h3>
              <p>
                Every auction detail page renders live pricing, history, and the form that posts
                bids into the service.
              </p>
              <Link to="/catalogue">Find a lot</Link>
            </article>
            <article>
              <h3>Authentication flow</h3>
              <p>
                OAuth-backed sign-in and sign-up screens that store your token for subsequent
                requests.
              </p>
              <Link to="/auth">Launch auth</Link>
            </article>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} BidSphere Auctions. Crafted for EECS4413.</p>
        <div>
          <a href="#features">Platform</a>
          <a href="#how-it-works">Support</a>
          <Link to="/auth?mode=signup">Become a seller</Link>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
