import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchAuctionDetail, placeBid, type AuctionDetail } from '../api/auctionApi';
import { Client, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { WS_ENDPOINT, isAuctionResultMessage, isBidUpdateMessage } from '../utils/socketHelpers';
import '../styles/pages/CataloguePage.css'; // Reuse styles for now

function AuctionDetailPage() {
  const { auctionId } = useParams<{ auctionId: string }>();
  const navigate = useNavigate();
  const [auction, setAuction] = useState<AuctionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [bidError, setBidError] = useState<string | null>(null);
  const [bidSuccess, setBidSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const stompRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!auctionId) return;

    const controller = new AbortController();
    fetchAuctionDetail(Number(auctionId), controller.signal)
      .then(setAuction)
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err.message);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [auctionId]);

  useEffect(() => {
    const client = new Client({
      reconnectDelay: 4000,
      webSocketFactory: () => new SockJS(WS_ENDPOINT),
    });

    client.onConnect = () => setSocketConnected(true);
    client.onDisconnect = () => setSocketConnected(false);
    client.onStompError = (frame) => {
      console.error('STOMP error on auction detail page', frame.headers['message']);
    };
    client.activate();
    stompRef.current = client;

    return () => {
      setSocketConnected(false);
      client.deactivate();
      stompRef.current = null;
    };
  }, []);

  const handleSocketPayload = useCallback((payload: unknown) => {
    if (isBidUpdateMessage(payload)) {
      setAuction((prev) => {
        if (!prev || prev.auctionId !== payload.auctionId) {
          return prev;
        }
        return {
          ...prev,
          currentPrice: payload.newHighestBid,
          highestBidderId: payload.highestBidderId,
          highestBidderName: payload.highestBidderName ?? prev.highestBidderName,
        };
      });
      setBidSuccess(payload.message ?? 'Bid update received');
      return;
    }

    if (isAuctionResultMessage(payload)) {
      setAuction((prev) => {
        if (!prev || prev.auctionId !== payload.auctionId) {
          return prev;
        }
        return {
          ...prev,
          currentPrice: payload.winningBid,
          highestBidderName: payload.winnerName ?? prev.highestBidderName,
          remainingTime: 'Ended',
          endsAt: payload.finalizedAt ?? prev.endsAt,
        };
      });
      return;
    }
  }, []);

  useEffect(() => {
    const client = stompRef.current;
    if (!client || !socketConnected || !auctionId) {
      return undefined;
    }

    const subscription = client.subscribe(`/topic/auction/${auctionId}`, (message: IMessage) => {
      try {
        const parsed = JSON.parse(message.body);
        handleSocketPayload(parsed);
      } catch (err) {
        console.error('Failed to parse auction update payload', err);
      }
    });

    return () => subscription.unsubscribe();
  }, [auctionId, handleSocketPayload, socketConnected]);

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auction) return;

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= auction.currentPrice) {
      setBidError('Bid must be higher than the current price.');
      return;
    }

    setSubmitting(true);
    setBidError(null);
    setBidSuccess(null);

    try {
      const response = await placeBid({
        auctionId: auction.auctionId,
        amount,
      });
      setBidSuccess(response.message);
      setAuction((prev) => prev ? {
        ...prev,
        currentPrice: response.newHighestBid,
        highestBidderName: response.highestBidderName,
        highestBidderId: response.highestBidderId
      } : null);
      setBidAmount('');
    } catch (err) {
      if (err instanceof Error) {
        setBidError(err.message);
      } else {
        setBidError('An unexpected error occurred.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="catalogue-loading">Loading auction...</div>;
  if (error) return <div className="catalogue-error">{error}</div>;
  if (!auction) return <div className="catalogue-empty">Auction not found.</div>;

  return (
    <div className="catalogue-page">
      <header className="catalogue-header">
        <div className="catalogue-brand" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
          <div className="brand-mark">
            <img src="/vite.svg" alt="Auction Platform icon" />
          </div>
          <div>
            <p className="brand-title">Auction Platform</p>
            <span className="brand-tagline">Live marketplace</span>
          </div>
        </div>
        <nav className="catalogue-nav">
            <button onClick={() => navigate('/catalogue')} className="nav-link" style={{background: 'none', border: 'none', cursor: 'pointer'}}>
                &larr; Back to Catalogue
            </button>
        </nav>
      </header>

      <main className="catalogue-grid" style={{ display: 'block', maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <article className="catalogue-card" style={{ cursor: 'default' }}>
            <div className="card-body">
                <div className="card-headline">
                    <h1>{auction.itemName}</h1>
                    <span className="category-chip">{auction.auctionType}</span>
                </div>
                <p className="card-description">{auction.itemDescription}</p>
                
                <div className="card-stats" style={{ marginTop: '2rem' }}>
                    <div>
                        <p className="label">Current Price</p>
                        <strong style={{ fontSize: '2rem' }}>${auction.currentPrice}</strong>
                    </div>
                    <div>
                        <p className="label">Highest Bidder</p>
                        <strong>{auction.highestBidderName || 'No bids yet'}</strong>
                    </div>
                    <div>
                        <p className="label">Ends In</p>
                        <strong>{auction.remainingTime || new Date(auction.endsAt).toLocaleString()}</strong>
                    </div>
                </div>

                <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8f9fa', borderRadius: '8px' }}>
                    <h3>Place a Bid</h3>
                    <form onSubmit={handleBid} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <input
                            type="number"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            placeholder={`Enter more than $${auction.currentPrice}`}
                            min={auction.currentPrice + 1}
                            step="1"
                            style={{ flex: 1, padding: '0.5rem' }}
                            required
                        />
                        <button type="submit" disabled={submitting}>
                            {submitting ? 'Placing Bid...' : 'Place Bid'}
                        </button>
                    </form>
                    {bidError && <p style={{ color: 'red', marginTop: '0.5rem' }}>{bidError}</p>}
                    {bidSuccess && <p style={{ color: 'green', marginTop: '0.5rem' }}>{bidSuccess}</p>}
                </div>
            </div>
        </article>
      </main>
    </div>
  );
}

export default AuctionDetailPage;
