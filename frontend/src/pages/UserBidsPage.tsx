import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchUserBids, type UserBidSummary } from '../api/auctionApi';
import '../styles/pages/UserBidsPage.css';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const getDisplayStatus = (summary: UserBidSummary) => {
  if (summary.status === 'ENDED') {
    return summary.winning ? 'Won' : 'Closed';
  }

  return summary.winning ? 'Leading' : 'Outbid';
};

const getFriendlyErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    const message = error.message.trim();
    if (!message || message.toLowerCase().includes('failed to fetch')) {
      return 'We could not load your bids right now. Please try again in a moment.';
    }
    return message;
  }
  return 'We could not load your bids right now. Please try again in a moment.';
};

function UserBidsPage() {
  const [bids, setBids] = useState<UserBidSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchUserBids(controller.signal)
      .then((data) => setBids(data))
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(getFriendlyErrorMessage(err));
          setBids([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [refreshIndex]);

  const activeBids = useMemo(
    () =>
      bids
        .filter((bid) => bid.status === 'ONGOING')
        .sort((a, b) => new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime()),
    [bids],
  );

  const winningBids = useMemo(
    () =>
      bids
        .filter((bid) => bid.status === 'ENDED' && bid.winning)
        .sort((a, b) => new Date(b.endsAt).getTime() - new Date(a.endsAt).getTime()),
    [bids],
  );

  const handleRefresh = () => setRefreshIndex((value) => value + 1);

  const renderBidCard = (summary: UserBidSummary) => (
    <article key={summary.auctionId} className="user-bid-card">
      <div className="user-bid-card__heading">
        <div>
          <p className="label">Lot #{summary.itemId}</p>
          <h3>{summary.itemName}</h3>
        </div>
        <div className={`status-pill status-pill--${summary.winning ? 'success' : 'neutral'}`}>
          {getDisplayStatus(summary)}
        </div>
      </div>

      <div className="user-bid-card__grid">
        <div>
          <p className="label">Your top bid</p>
          <strong>{currencyFormatter.format(summary.userBidAmount)}</strong>
        </div>
        <div>
          <p className="label">Current price</p>
          <strong>{currencyFormatter.format(summary.currentPrice)}</strong>
        </div>
        <div>
          <p className="label">Closes</p>
          <span>{new Date(summary.endsAt).toLocaleString()}</span>
        </div>
        <div>
          <p className="label">Last bid placed</p>
          <span>{new Date(summary.lastBidAt).toLocaleString()}</span>
        </div>
      </div>

      <footer className="user-bid-card__footer">
        <Link to="/catalogue" className="inline-link">
          Continue browsing
        </Link>
      </footer>
    </article>
  );

  return (
    <div className="user-bids-page">
      <div className="user-bids-layout">
      <header className="user-bids-page__header">
        <div>
          <p className="eyebrow">My bids</p>
          <h1>Track the auctions you care about</h1>
          <p>
            We only keep the lots you&apos;re still in the running for. Ended auctions remain here
            only if you secured the winning bid.
          </p>
        </div>
        <div className="user-bids-page__actions">
          <button type="button" onClick={handleRefresh} disabled={loading}>
            Refresh
          </button>
          <Link to="/catalogue" className="primary-link">
            Back to catalogue
          </Link>
        </div>
      </header>

      {loading && <p className="user-bids-page__hint">Loading your bids…</p>}
      {error && !loading && (
        <div className="user-bids-page__error">
          <p>{error}</p>
          <button type="button" onClick={handleRefresh}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && bids.length === 0 && (
        <div className="user-bids-page__empty">
          <p>You haven&apos;t placed any bids that qualify for this list yet.</p>
          <span>
            Place a bid on an ongoing auction and we&apos;ll track it here. Wins stay pinned for your
            records.
          </span>
        </div>
      )}

      {!loading && !error && bids.length > 0 && (
        <div className="user-bids-page__sections">
          <section>
            <div className="section-heading">
              <h2>Active participation</h2>
              <span>{activeBids.length} ongoing</span>
            </div>
            {activeBids.length === 0 ? (
              <p className="section-hint">No active bids right now.</p>
            ) : (
              <div className="user-bid-list">{activeBids.map(renderBidCard)}</div>
            )}
          </section>

          <section>
            <div className="section-heading">
              <h2>Recent wins</h2>
              <span>{winningBids.length} won</span>
            </div>
            {winningBids.length === 0 ? (
              <p className="section-hint">You haven&apos;t won an auction yet.</p>
            ) : (
              <div className="user-bid-list">{winningBids.map(renderBidCard)}</div>
            )}
          </section>
        </div>
      )}
      </div>
    </div>
  );
}

export default UserBidsPage;
