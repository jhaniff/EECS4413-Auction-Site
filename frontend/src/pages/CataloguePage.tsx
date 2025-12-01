import { type ChangeEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { searchAuctions, type AuctionSummary, type SortDirection } from '../api/auctionApi';
import '../styles/pages/CataloguePage.css';

const PAGE_SIZE = 9;
const DEFAULT_TYPE_FILTER = 'All types';

interface SortPreset {
  id: string;
  label: string;
  sortBy: string;
  direction: SortDirection;
}

const SORT_PRESETS: SortPreset[] = [
  { id: 'time-asc', label: 'Time remaining', sortBy: 'endsAt', direction: 'asc' },
  { id: 'price-desc', label: 'Current price (high to low)', sortBy: 'currentPrice', direction: 'desc' },
  { id: 'price-asc', label: 'Current price (low to high)', sortBy: 'currentPrice', direction: 'asc' },
  { id: 'newest', label: 'Newest arrivals', sortBy: 'auctionId', direction: 'desc' },
];

interface PriceRangeOption {
  id: string;
  label: string;
  min?: number;
  max?: number;
}

const PRICE_RANGE_OPTIONS: PriceRangeOption[] = [
  { id: 'any', label: 'Any price' },
  { id: 'under-1k', label: 'Under $1,000', max: 1000 },
  { id: '1-5k', label: '$1,000 - $5,000', min: 1000, max: 5000 },
  { id: 'over-5k', label: '$5,000 and up', min: 5000 },
];

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

type AuctionStatus = 'live' | 'ending' | 'scheduled' | 'ended';

interface DerivedAuction extends AuctionSummary {
  status: AuctionStatus;
  relativeTime: string;
  relativeTimeLabel: string;
  displayStatusLabel: string;
  displayStatusClass: string;
  shippingInfo: string;
  shippingCostLabel: string;
  auctionTypeLabel: string;
  bidsCount: number;
}

const getCatalogueErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    const message = error.message.trim();
    const normalized = message.toLowerCase();

    if (normalized.includes('failed to fetch') || normalized.includes('network')) {
      return 'We could not reach the auction service. Check your connection and try again.';
    }

    if (normalized.includes('timeout')) {
      return 'The auction service is taking longer than expected. Please retry in a moment.';
    }

    if (!message) {
      return 'Something went wrong while loading auctions. Please try again.';
    }

    return message;
  }

  return 'Something went wrong while loading auctions. Please try again.';
};

function decodeJwtSubject(token: string | null) {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decodeBase64 = typeof globalThis.atob === 'function' ? globalThis.atob : null;
    if (!decodeBase64) return null;
    const decoded = JSON.parse(decodeBase64(normalized));
    return decoded.sub ?? null;
  } catch (error) {
    console.warn('Unable to decode auth token', error);
    return null;
  }
}

function formatCurrency(value?: number) {
  if (typeof value !== 'number') return '—';
  return currencyFormatter.format(value);
}

function deriveStatus(auction: AuctionSummary): AuctionStatus {
  if (!auction.endsAt) {
    return 'live';
  }

  const diffMs = new Date(auction.endsAt).getTime() - Date.now();
  if (!Number.isFinite(diffMs)) {
    return 'live';
  }

  const hours = diffMs / (1000 * 60 * 60);
  if (hours <= 0) return 'ended';
  if (hours <= 1) return 'ending';
  if (hours >= 24) return 'scheduled';
  return 'live';
}

function formatRelativeTime(auction: AuctionSummary): string {
  const provided = auction.remainingTime?.trim();
  if (provided) return provided;

  if (!auction.endsAt) {
    return '—';
  }

  const diffMs = new Date(auction.endsAt).getTime() - Date.now();
  if (!Number.isFinite(diffMs)) {
    return '—';
  }
  if (diffMs <= 0) {
    return 'Ended';
  }

  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes - days * 24 * 60) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
}

function CataloguePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState(DEFAULT_TYPE_FILTER);
  const [sortPreset, setSortPreset] = useState<string>(SORT_PRESETS[0].id);
  const [priceRange, setPriceRange] = useState<string>(PRICE_RANGE_OPTIONS[0].id);
  const [page, setPage] = useState(0);
  const [auctions, setAuctions] = useState<AuctionSummary[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [username, setUsername] = useState<string>(() => decodeJwtSubject(localStorage.getItem('authToken')) ?? 'Guest');
  const [selectedAuctionId, setSelectedAuctionId] = useState<number | null>(null);

  useEffect(() => {
    setUsername(decodeJwtSubject(localStorage.getItem('authToken')) ?? 'Guest');
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, sortPreset]);

  useEffect(() => {
    setPage(0);
  }, [typeFilter, priceRange]);

  const activeSortOption = useMemo(() => {
    return SORT_PRESETS.find((option) => option.id === sortPreset) ?? SORT_PRESETS[0];
  }, [sortPreset]);

  const sortField = activeSortOption.sortBy;
  const sortDirection = activeSortOption.direction;

  const selectedPriceRange = useMemo(() => {
    return PRICE_RANGE_OPTIONS.find((option) => option.id === priceRange) ?? PRICE_RANGE_OPTIONS[0];
  }, [priceRange]);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    async function loadAuctions() {
      setLoading(true);
      setError(null);

      try {
        const { items, totalElements, totalPages } = await searchAuctions({
          query: debouncedSearch,
          page,
          size: PAGE_SIZE,
          sortBy: sortField,
          direction: sortDirection,
          signal: controller.signal,
        });

        if (cancelled) {
          return;
        }

        if (totalPages > 0 && page > totalPages - 1) {
          setPage(Math.max(totalPages - 1, 0));
          return;
        }

        if (totalPages === 0 && page !== 0) {
          setPage(0);
          return;
        }

        setAuctions(items);
        setTotalElements(totalElements);
        setTotalPages(totalPages);
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }
        setError(getCatalogueErrorMessage(err));
        setAuctions([]);
        setTotalElements(0);
        setTotalPages(0);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAuctions();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [debouncedSearch, page, sortField, sortDirection, refreshKey]);

  const typeOptions = useMemo(() => {
    const uniqueTypes = new Set<string>();
    auctions.forEach((auction) => {
      if (auction.type) {
        uniqueTypes.add(auction.type);
      }
    });
    return [DEFAULT_TYPE_FILTER, ...uniqueTypes];
  }, [auctions]);

  useEffect(() => {
    if (typeFilter !== DEFAULT_TYPE_FILTER && !typeOptions.includes(typeFilter)) {
      setTypeFilter(DEFAULT_TYPE_FILTER);
    }
  }, [typeFilter, typeOptions]);

  const derivedAuctions = useMemo<DerivedAuction[]>(() => {
    return auctions.map((auction) => {
      const status = deriveStatus(auction);
      const relativeTime = formatRelativeTime(auction);
      const relativeTimeLabel = relativeTime === 'Ended' ? 'Ended' : `${relativeTime} left`;
      const bidsCount = typeof auction.bidCount === 'number' ? auction.bidCount : 0;
      const shippingInfo = auction.shippingInfo ?? 'Ships worldwide in 2-4 business days';

      let shippingCostLabel = 'Shipping calculated at checkout';
      if (typeof auction.shippingCost === 'number') {
        if (auction.shippingCost === 0) {
          shippingCostLabel = 'Free shipping';
        } else {
          shippingCostLabel = `${formatCurrency(auction.shippingCost)} shipping`;
        }
      }

      return {
        ...auction,
        status,
        relativeTime,
        relativeTimeLabel,
        displayStatusLabel: 'Active',
        displayStatusClass: 'active',
        shippingInfo,
        shippingCostLabel,
        auctionTypeLabel: 'Forward',
        bidsCount,
      };
    });
  }, [auctions]);

  const filteredAuctions = useMemo(() => {
    const priceMin = selectedPriceRange.min;
    const priceMax = selectedPriceRange.max;

    return derivedAuctions.filter((auction) => {
      if (typeFilter !== DEFAULT_TYPE_FILTER && auction.type !== typeFilter) {
        return false;
      }

      const price = auction.currentPrice ?? 0;
      if (typeof priceMin === 'number' && price < priceMin) {
        return false;
      }

      if (typeof priceMax === 'number' && price > priceMax) {
        return false;
      }

      return true;
    });
  }, [derivedAuctions, typeFilter, selectedPriceRange]);

  useEffect(() => {
    if (selectedAuctionId === null) {
      return;
    }
    const stillVisible = filteredAuctions.some((auction) => auction.auctionId === selectedAuctionId);
    if (!stillVisible) {
      setSelectedAuctionId(null);
    }
  }, [filteredAuctions, selectedAuctionId]);

  const heroStats = useMemo(() => {
    const closingSoon = derivedAuctions.filter((auction) => auction.status === 'ending').length;
    const highestBid = derivedAuctions.reduce(
      (max, auction) => Math.max(max, auction.currentPrice ?? 0),
      0,
    );

    return {
      total: totalElements,
      closingSoon,
      highestBid,
    };
  }, [derivedAuctions, totalElements]);

  const showLoadingState = loading && filteredAuctions.length === 0 && !error;
  const showEmptyState = !loading && !error && filteredAuctions.length === 0;
  const disablePrev = page === 0 || loading;
  const disableNext = totalPages === 0 || page >= totalPages - 1 || loading;

  const handleTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setTypeFilter(event.target.value);
  };

  const handleSortChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSortPreset(event.target.value);
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handlePriceChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setPriceRange(event.target.value);
  };

  const handleSelectAuction = (auctionId: number) => {
    setSelectedAuctionId(auctionId);
  };

  const handleViewAuction = (auctionId: number) => {
    navigate(`/auction/${auctionId}`);
  };

  const handleBidOnSelected = () => {
    if (selectedAuctionId === null) {
      return;
    }
    handleViewAuction(selectedAuctionId);
  };

  const handleRetry = () => {
    setRefreshKey((value) => value + 1);
  };

  const handleRefresh = () => {
    setRefreshKey((value) => value + 1);
  };

  const goToPreviousPage = () => {
    setPage((value) => Math.max(value - 1, 0));
  };

  const goToNextPage = () => {
    setPage((value) => (totalPages === 0 ? value : Math.min(value + 1, totalPages - 1)));
  };

  const handleSignOut = () => {
    localStorage.removeItem('authToken');
    setUsername('Guest');
    navigate('/auth?mode=signin');
  };

  const activeQuery = debouncedSearch || searchTerm.trim();
  const emptyStateMessage = activeQuery
    ? `No active auctions found for '${activeQuery}'`
    : 'No active auctions match your filters yet.';

  const canBidOnSelected = selectedAuctionId !== null;
  const footerMessage = canBidOnSelected
    ? `Lot #${selectedAuctionId} selected`
    : 'Select an auction above to enable bidding';

  return (
    <div className="catalogue-page">
      <header className="catalogue-header">
        <div className="catalogue-brand">
          <div className="brand-mark">
            <img src="/vite.svg" alt="Auction Platform icon" />
          </div>
          <div>
            <p className="brand-title">Auction Platform</p>
            <span className="brand-tagline">Live marketplace</span>
          </div>
        </div>

        <nav className="catalogue-nav">
          <Link to="/catalogue" className="nav-link">
            Browse
          </Link>
          <Link to="/sell" className="nav-link">
            Sell an item
          </Link>
          <Link to="/bids" className="nav-link">
            My bids
          </Link>
        </nav>

        <div className="catalogue-account">
          <span className="catalogue-username">Signed in as {username}</span>
          <button type="button" onClick={handleSignOut} className="signout-btn">
            Sign out
          </button>
        </div>
      </header>

      <section className="catalogue-hero">
        <div className="catalogue-hero__text">
          <p className="eyebrow">Live marketplace</p>
          <h1>Bid on curated collectibles and design icons</h1>
          <p>
            Track premium auctions in real time, set alerts, and submit verified bids backed by our
            secure checkout pipeline.
          </p>
        </div>
        <div className="catalogue-hero__stats">
          <div>
            <span>{heroStats.total.toLocaleString()}</span>
            <p>Auctions indexed</p>
          </div>
          <div>
            <span>{heroStats.closingSoon}</span>
            <p>Ending within the hour</p>
          </div>
          <div>
            <span>{formatCurrency(heroStats.highestBid)}</span>
            <p>Top bid on this page</p>
          </div>
        </div>
      </section>

      <section className="catalogue-toolbar">
        <div className="catalogue-search">
          <input
            type="search"
            placeholder="Search by keyword, artist, or lot"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="catalogue-filters">
          <div className="filter-group">
            <label className="filter-label" htmlFor="filter-type">
              Category
            </label>
            <select id="filter-type" value={typeFilter} onChange={handleTypeChange}>
              {typeOptions.map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label" htmlFor="filter-sort">
              Sort by
            </label>
            <select id="filter-sort" value={sortPreset} onChange={handleSortChange}>
              {SORT_PRESETS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label" htmlFor="filter-price">
              Current bid range
            </label>
            <select id="filter-price" value={priceRange} onChange={handlePriceChange}>
              {PRICE_RANGE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="catalogue-grid">
        {showLoadingState && (
          <div className="catalogue-loading">
            <p>Loading live auctions…</p>
          </div>
        )}

        {error && (
          <div className="catalogue-error">
            <p>{error}</p>
            <button type="button" onClick={handleRetry}>
              Try again
            </button>
          </div>
        )}

        {showEmptyState && (
          <div className="catalogue-empty">
            <p>{emptyStateMessage}</p>
            <span>Adjust your filters or try a different category.</span>
          </div>
        )}

        {!error &&
          filteredAuctions.map((item) => (
            <article key={item.auctionId} className="catalogue-card">
              <div className="card-body">
                <div className="card-status">
                  <span className={`status-badge status-${item.displayStatusClass}`}>
                    {item.displayStatusLabel}
                  </span>
                  <span className="card-timer chip">{item.relativeTimeLabel}</span>
                </div>
                <div className="card-headline">
                  <div className="card-meta">
                    <span className="lot-id">#{item.auctionId}</span>
                    <span className="category-chip">{item.auctionTypeLabel}</span>
                  </div>
                  <label className="card-select">
                    <input
                      type="radio"
                      name="catalogue-selection"
                      value={item.auctionId}
                      checked={selectedAuctionId === item.auctionId}
                      onChange={() => handleSelectAuction(item.auctionId)}
                    />
                    <span>Select</span>
                  </label>
                </div>
                <button type="button" className="item-link" onClick={() => handleViewAuction(item.auctionId)}>
                  {item.itemName}
                </button>
                <p className="card-description">
                  Current highest bidder:{' '}
                  {item.highestBidder ? item.highestBidder : 'No bids yet'}
                </p>
                <p className="card-timer">{item.relativeTimeLabel}</p>

                <div className="card-stats">
                  <div>
                    <p className="label">Current bid</p>
                    <strong>{formatCurrency(item.currentPrice)}</strong>
                  </div>
                  <div>
                    <p className="label">Number of bids</p>
                    <strong>{item.bidsCount}</strong>
                  </div>
                  <div>
                    <p className="label">Auction type</p>
                    <strong>{item.auctionTypeLabel}</strong>
                  </div>
                </div>

                <div className="card-logistics">
                  <div>
                    <p className="label">Shipping</p>
                    <span>{item.shippingInfo}</span>
                  </div>
                  <div>
                    <p className="label">Shipping cost</p>
                    <span>{item.shippingCostLabel}</span>
                  </div>
                  <div>
                    <p className="label">Status</p>
                    <span className="status-pill">{item.displayStatusLabel}</span>
                  </div>
                </div>

                <div className="card-footer">
                  <div>
                    <p className="label">Lot</p>
                    <span>{item.itemId}</span>
                  </div>
                  <div>
                    <p className="label">Ends at</p>
                    <span>{item.endsAt ? new Date(item.endsAt).toLocaleString() : '—'}</span>
                  </div>
                </div>

                <div className="card-actions">
                  <button type="button" className="secondary-btn" onClick={handleRefresh}>
                    Refresh lot
                  </button>
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={() => handleViewAuction(item.auctionId)}
                  >
                    View & bid
                  </button>
                </div>
              </div>
            </article>
          ))}
      </section>

      {totalPages > 0 && !error && (
        <div className="catalogue-pagination">
          <button type="button" onClick={handleRefresh} disabled={loading}>
            Refresh
          </button>
          <button type="button" onClick={goToPreviousPage} disabled={disablePrev}>
            Previous
          </button>
          <p>
            Page {totalPages === 0 ? 1 : page + 1} of {Math.max(totalPages, 1)}
          </p>
          <button type="button" onClick={goToNextPage} disabled={disableNext}>
            Next
          </button>
        </div>
      )}

      <footer className="catalogue-footer">
        <div className="footer-selection" role="status" aria-live="polite">
          {footerMessage}
        </div>
        <button
          type="button"
          className="footer-bid-btn"
          disabled={!canBidOnSelected}
          onClick={handleBidOnSelected}
        >
          Bid on selected item
        </button>
      </footer>
    </div>
  );
}

export default CataloguePage;
