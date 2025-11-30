import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createItem } from '../api/itemApi';
import '../styles/pages/SellItemPage.css';

const typeOptions = ['Forward', 'Dutch', 'Sealed'];

const initialState = {
  name: '',
  description: '',
  type: 'Forward',
  shippingDays: '5',
  baseShipCost: '25',
  expeditedCost: '60',
  startPrice: '10',
  endsAt: '',
  keywords: '',
};

function SellItemPage() {
  const [formState, setFormState] = useState(() => ({
    ...initialState,
    endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  }));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const isSignedIn = useMemo(() => Boolean(localStorage.getItem('authToken')), []);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isSignedIn) {
      setError('You need to sign in before listing an item.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const keywords = formState.keywords
        .split(',')
        .map((keyword) => keyword.trim())
        .filter(Boolean);

      const payload = {
        name: formState.name.trim(),
        description: formState.description.trim(),
        type: formState.type,
        shippingDays: Number.parseInt(formState.shippingDays, 10),
        baseShipCost: Number.parseFloat(formState.baseShipCost),
        expeditedCost: Number.parseFloat(formState.expeditedCost),
        startPrice: Number.parseInt(formState.startPrice, 10),
        endsAt: new Date(formState.endsAt).toISOString(),
        keywords,
      };

      const item = await createItem(payload);
      setSuccessMessage(`Item #${item.itemId} created successfully. You can now attach it to an auction.`);
      setFormState(initialState);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unable to submit this item right now. Please try again later.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sell-item-page">
      <div className="sell-item-layout">
        <header className="sell-item-header">
          <div>
            <p className="eyebrow">Sell an item</p>
            <h1>Launch a new lot in minutes</h1>
            <p>
              Provide the core logistics for your collectible and we&apos;ll automatically launch its auction
              once everything is saved.
            </p>
          </div>
          <Link to="/catalogue" className="ghost-link">
            Back to catalogue
          </Link>
        </header>

        <form className="sell-item-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="name">Item name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formState.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formState.description}
              onChange={handleChange}
              rows={5}
              required
            />
          </div>

          <div className="form-grid">
            <div className="form-row">
              <label htmlFor="type">Auction type</label>
              <select id="type" name="type" value={formState.type} onChange={handleChange}>
                {typeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label htmlFor="shippingDays">Shipping timeframe (days)</label>
              <input
                id="shippingDays"
                name="shippingDays"
                type="number"
                min="1"
                value={formState.shippingDays}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-row">
              <label htmlFor="baseShipCost">Standard shipping cost (USD)</label>
              <input
                id="baseShipCost"
                name="baseShipCost"
                type="number"
                min="0"
                step="0.01"
                value={formState.baseShipCost}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-row">
              <label htmlFor="expeditedCost">Expedited shipping cost (USD)</label>
              <input
                id="expeditedCost"
                name="expeditedCost"
                type="number"
                min="0"
                step="0.01"
                value={formState.expeditedCost}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-row">
              <label htmlFor="startPrice">Start Price (CAD)</label>
              <input
                id="startPrice"
                name="startPrice"
                type="number"
                min="1"
                value={formState.startPrice}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-row">
              <label htmlFor="endsAt">Auction End Date</label>
              <input
                id="endsAt"
                name="endsAt"
                type="datetime-local"
                value={formState.endsAt}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <label htmlFor="keywords">Keywords (comma separated)</label>
            <input
              id="keywords"
              name="keywords"
              type="text"
              placeholder="design, mid-century, furniture"
              value={formState.keywords}
              onChange={handleChange}
            />
          </div>

          {error && <p className="form-error">{error}</p>}
          {successMessage && <p className="form-success">{successMessage}</p>}

          <div className="form-actions">
            <button type="submit" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Save item'}
            </button>
            <button type="button" className="secondary" onClick={() => navigate('/catalogue')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SellItemPage;
