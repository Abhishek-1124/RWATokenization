import React from 'react';
import { useNavigate } from 'react-router-dom';
import { parseEther } from 'ethers';
import { useWallet } from '../../hooks/useWallet';
import { useMarketplaceContract } from '../../hooks/useMarketplaceContract';
import { useFractionalTokenContract } from '../../hooks/useFractionalTokenContract';
import { useContractAddresses } from '../../hooks/useContractAddresses';
import './Marketplace.css';

interface Asset {
  id: string;
  title: string;
  category: string;
  description: string;
  price: string;
  priceInHBAR: string;
  tokenId: string;
  available: number;
  image: string;
  featured?: boolean;
}

const Marketplace: React.FC = () => {
  const { isConnected, address } = useWallet();
  const market = useMarketplaceContract();
  const fractional = useFractionalTokenContract();
  const { addresses } = useContractAddresses();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [isApproved, setIsApproved] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');
  const [message, setMessage] = React.useState<string>('');
  const [listingRows, setListingRows] = React.useState<Array<{
    id: number;
    seller: string;
    assetId: string;
    amountRemaining: string;
    pricePerUnitWei: string;
    active: boolean;
  }>>([]);

  const [listAssetId, setListAssetId] = React.useState('1');
  const [listAmount, setListAmount] = React.useState('100');
  const [listPricePerUnit, setListPricePerUnit] = React.useState('1');

  const [buyListingId, setBuyListingId] = React.useState('1');
  const [buyAmount, setBuyAmount] = React.useState('1');

  const featuredAssets: Asset[] = [
    {
      id: '1',
      title: 'Chicago House',
      category: 'Real Estate',
      description: 'Modern apartments with panoramic lake views, gym, and rooftop pool.',
      price: '$0.3317',
      priceInHBAR: '3.0000 HBAR',
      tokenId: '#930401966',
      available: 2093,
      image: '/src/assets/chicago-house.jpg',
      featured: true,
    },
    {
      id: '2',
      title: 'Miami Beach Villa',
      category: 'Real Estate',
      description: 'Luxury beachfront property with private pool and ocean views.',
      price: '$0.5250',
      priceInHBAR: '5.0000 HBAR',
      tokenId: '#930401967',
      available: 1500,
      image: '/src/assets/miami-villa.jpg',
      featured: true,
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredAssets.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredAssets.length) % featuredAssets.length);
  };

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const loadApprovalState = React.useCallback(async () => {
    if (!address || !addresses.marketplace || !addresses.fractionalToken) {
      setIsApproved(false);
      return;
    }

    try {
      const approved = await fractional.isApprovedForAll(address, addresses.marketplace);
      setIsApproved(approved);
    } catch {
      setIsApproved(false);
    }
  }, [address, addresses.marketplace, addresses.fractionalToken, fractional]);

  const loadListings = React.useCallback(async () => {
    if (!addresses.marketplace) {
      setListingRows([]);
      return;
    }

    try {
      const total = Number(await market.listingCount());
      const max = Math.min(total, 12);
      const ids = Array.from({ length: max }, (_, i) => total - i).filter((id) => id > 0);

      const rows = await Promise.all(
        ids.map(async (id) => {
          const l = await market.getListing(id);
          if (!l) return null;
          return {
            id,
            seller: l.seller,
            assetId: l.assetId.toString(),
            amountRemaining: l.amountRemaining.toString(),
            pricePerUnitWei: l.pricePerUnit.toString(),
            active: l.active,
          };
        }),
      );

      setListingRows(rows.filter((r): r is NonNullable<typeof r> => r !== null));
    } catch (e) {
      console.error(e);
    }
  }, [addresses.marketplace, market]);

  React.useEffect(() => {
    if (isConnected) {
      loadApprovalState();
      loadListings();
    }
  }, [isConnected, loadApprovalState, loadListings]);

  const withAction = async (fn: () => Promise<void>) => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await fn();
      await loadApprovalState();
      await loadListings();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    await withAction(async () => {
      if (!addresses.marketplace) throw new Error('Marketplace address is not configured');
      await fractional.setApprovalForAll(addresses.marketplace, true);
      setMessage('Marketplace approved to transfer your fractions.');
    });
  };

  const handleList = async () => {
    await withAction(async () => {
      const assetId = Number(listAssetId);
      const amount = Number(listAmount);
      const pricePerUnitWei = parseEther(listPricePerUnit || '0');

      if (!Number.isInteger(assetId) || assetId < 1) throw new Error('Asset ID must be a positive integer');
      if (!Number.isInteger(amount) || amount < 1) throw new Error('Amount must be a positive integer');
      if (pricePerUnitWei <= 0n) throw new Error('Price per unit must be greater than 0');

      await market.list(assetId, amount, pricePerUnitWei);
      setMessage('Listing created successfully.');
    });
  };

  const handleBuy = async () => {
    await withAction(async () => {
      const listingId = Number(buyListingId);
      const amount = Number(buyAmount);

      if (!Number.isInteger(listingId) || listingId < 1) throw new Error('Listing ID must be a positive integer');
      if (!Number.isInteger(amount) || amount < 1) throw new Error('Amount must be a positive integer');

      const listing = await market.getListing(listingId);
      if (!listing || !listing.active) throw new Error('Listing is not active');
      const total = listing.pricePerUnit * BigInt(amount);

      await market.buy(listingId, amount, total);
      setMessage('Purchase completed successfully.');
    });
  };

  return (
    <div className="marketplace-page">
      {/* Header */}
      <header className="marketplace-header">
        <div className="header-container">
          <div className="logo" onClick={() => navigate('/')}>
            <div className="logo-icon">🏠</div>
            <span className="logo-text">RWA // NEXUS</span>
          </div>
          <nav className="nav">
            <a href="/" className="nav-link">Explore</a>
            <a href="/dashboard" className="nav-link">About</a>
            <a href="/dashboard" className="nav-link">Help</a>
            {isConnected && (
              <button className="dashboard-btn" onClick={() => navigate('/dashboard')}>
                📊 My Dashboard
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Featured Section */}
      <section className="featured-section">
        <div className="featured-container">
          <div className="carousel">
            <button className="carousel-btn prev" onClick={prevSlide}>
              ‹
            </button>
            <button className="carousel-btn next" onClick={nextSlide}>
              ›
            </button>

            <div className="carousel-content">
              <div className="carousel-image-section">
                <div className="featured-badge">✨ FEATURED</div>
                <img
                  src={featuredAssets[currentSlide].image}
                  alt={featuredAssets[currentSlide].title}
                  className="carousel-image"
                />
              </div>

              <div className="carousel-details">
                <span className="asset-category">{featuredAssets[currentSlide].category}</span>
                <h1 className="asset-title">{featuredAssets[currentSlide].title}</h1>
                <p className="asset-description">{featuredAssets[currentSlide].description}</p>

                <div className="asset-pricing">
                  <div className="price-main">{featuredAssets[currentSlide].price}</div>
                  <div className="price-sub">
                    Price per token ({featuredAssets[currentSlide].priceInHBAR})
                  </div>
                </div>

                <div className="asset-token-info">
                  <span className="token-id">Token {featuredAssets[currentSlide].tokenId}</span>
                  <span className="token-available">
                    {featuredAssets[currentSlide].available} Available
                  </span>
                </div>

                <div className="asset-actions">
                  <button className="btn-view-details">View Details</button>
                  <button className="btn-invest-now">Invest Now</button>
                </div>
              </div>
            </div>

            <div className="carousel-indicators">
              {featuredAssets.map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="onchain-section">
        <div className="featured-container">
          <div className="onchain-panel">
            <h2>On-Chain Marketplace</h2>

            {!isConnected && <p className="onchain-note">Connect wallet first to list or buy fractions.</p>}
            {isConnected && !addresses.marketplace && (
              <p className="onchain-note">Marketplace address is not configured. Open Issuer page and set addresses.</p>
            )}

            {error && <p className="onchain-error">{error}</p>}
            {message && <p className="onchain-success">{message}</p>}

            <div className="onchain-grid">
              <div className="onchain-card">
                <h3>Step 10A: Approve Marketplace</h3>
                <p>Status: {isApproved ? 'Approved' : 'Not approved'}</p>
                <button className="btn-invest-now" disabled={!isConnected || loading} onClick={handleApprove}>
                  {loading ? 'Processing...' : 'Approve ERC-1155'}
                </button>
              </div>

              <div className="onchain-card">
                <h3>Step 10B: Create Listing</h3>
                <input
                  className="onchain-input"
                  value={listAssetId}
                  onChange={(e) => setListAssetId(e.target.value)}
                  placeholder="Asset ID"
                />
                <input
                  className="onchain-input"
                  value={listAmount}
                  onChange={(e) => setListAmount(e.target.value)}
                  placeholder="Fraction amount"
                />
                <input
                  className="onchain-input"
                  value={listPricePerUnit}
                  onChange={(e) => setListPricePerUnit(e.target.value)}
                  placeholder="Price per fraction in HBAR"
                />
                <button className="btn-invest-now" disabled={!isConnected || loading || !isApproved} onClick={handleList}>
                  {loading ? 'Processing...' : 'List Fractions'}
                </button>
              </div>

              <div className="onchain-card">
                <h3>Step 11: Buy Fractions</h3>
                <input
                  className="onchain-input"
                  value={buyListingId}
                  onChange={(e) => setBuyListingId(e.target.value)}
                  placeholder="Listing ID"
                />
                <input
                  className="onchain-input"
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(e.target.value)}
                  placeholder="Amount to buy"
                />
                <button className="btn-invest-now" disabled={!isConnected || loading} onClick={handleBuy}>
                  {loading ? 'Processing...' : 'Buy Now'}
                </button>
              </div>
            </div>

            <div className="listing-table-wrap">
              <div className="listing-header-row">
                <h3>Recent Listings</h3>
                <button className="btn-view-details" onClick={loadListings}>Refresh</button>
              </div>

              <div className="listing-table">
                <div className="listing-row listing-head">
                  <span>ID</span>
                  <span>Seller</span>
                  <span>Asset</span>
                  <span>Remaining</span>
                  <span>Price/Unit (wei)</span>
                  <span>Status</span>
                </div>

                {listingRows.map((row) => (
                  <div key={row.id} className="listing-row">
                    <span>{row.id}</span>
                    <span>{truncate(row.seller)}</span>
                    <span>{row.assetId}</span>
                    <span>{row.amountRemaining}</span>
                    <span>{row.pricePerUnitWei}</span>
                    <span>{row.active ? 'Active' : 'Closed'}</span>
                  </div>
                ))}

                {listingRows.length === 0 && <p className="onchain-note">No listings found yet.</p>}
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="marketplace-footer">
        <div className="footer-container">
          <div className="footer-badge">
            <div className="badge-icon">⬢</div>
            <div className="badge-text">
              <span className="badge-label">WEB3 COMPATIBLE • HASHGRAPH NETWORK</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Marketplace;
