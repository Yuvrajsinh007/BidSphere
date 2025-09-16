import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './AdminItems.css';
import debounce from '../utils/debounce';

const AdminItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleting, setDeleting] = useState(null);
  const searchInputRef = useRef(null);
  
  // Create debounced search function
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearch(value);
      setCurrentPage(1);
    }, 500),
    []
  );

  useEffect(() => {
    fetchItems();
  }, [currentPage, search, status]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/items?page=${currentPage}&search=${search}&status=${status}`);
      setItems(response.data.items);
      setTotalPages(response.data.pagination.total);
    } catch (error) {
      setError('Failed to load items');
      console.error('Fetch items error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(itemId);
      await api.delete(`/admin/items/${itemId}`);
      setItems(items.filter(item => item._id !== itemId));
      alert('Item deleted successfully');
    } catch (error) {
      alert('Failed to delete item');
      console.error('Delete item error:', error);
    } finally {
      setDeleting(null);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const getStatusBadge = (item) => {
    const now = new Date();
    const endTime = new Date(item.endTime);
    
    if (item.status === 'sold') {
      return <span className="status-badge sold">Sold</span>;
    } else if (item.status === 'closed') {
      return <span className="status-badge closed">Closed</span>;
    } else if (endTime <= now) {
      return <span className="status-badge expired">Expired</span>;
    } else {
      return <span className="status-badge active">Active</span>;
    }
  };

  const formatTimeRemaining = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="admin-items">
        <div className="loading">Loading items...</div>
      </div>
    );
  }

  return (
    <div className="admin-items">
      <div className="admin-header">
        <h1>Manage Items</h1>
        <p>View and manage all auction items</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Filters */}
      <div className="filters-section">
        <form onSubmit={handleSearch} className="filters-form">
          <input
            type="text"
            placeholder="Search items by title..."
            ref={searchInputRef}
            defaultValue={search}
            onChange={(e) => debouncedSearch(e.target.value)}
            className="search-input"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="status-filter"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="ended">Ended</option>
          </select>

        </form>
      </div>

      {/* Items Grid */}
      <div className="items-grid">
        {items.map(item => (
          <div key={item._id} className="item-card">
            <div className="item-image">
              {item.images && item.images.length > 0 ? (
                <img src={item.images[0]} alt={item.title} />
              ) : (
                <div className="no-image">No Image</div>
              )}
            </div>
            <div className="item-content">
              <h3 className="item-title">{item.title}</h3>
              <p className="item-seller">Seller: {item.seller?.name || 'Unknown'}</p>
              <p className="item-price">Current Bid: ${item.currentBid || item.basePrice}</p>
              <p className="item-end-time">
                Ends: {new Date(item.endTime).toLocaleDateString()}
              </p>
              <div className="item-status">
                {getStatusBadge(item)}
                {item.status === 'active' && (
                  <span className="time-remaining">
                    {formatTimeRemaining(item.endTime)}
                  </span>
                )}
              </div>
              <div className="item-actions">
                <Link to={`/item/${item._id}`} className="btn btn-secondary">
                  View Details
                </Link>
                <button
                  onClick={() => handleDelete(item._id)}
                  disabled={deleting === item._id}
                  className="btn btn-danger"
                >
                  {deleting === item._id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="btn btn-secondary"
          >
            Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="btn btn-secondary"
          >
            Next
          </button>
        </div>
      )}

      {items.length === 0 && !loading && (
        <div className="no-data">
          <p>No items found.</p>
        </div>
      )}
    </div>
  );
};

export default AdminItems;