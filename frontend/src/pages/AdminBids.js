import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './AdminBids.css';

const AdminBids = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [itemId, setItemId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchBids();
  }, [currentPage, itemId]);

  const fetchBids = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/bids?page=${currentPage}&itemId=${itemId}`);
      setBids(response.data.bids);
      setTotalPages(response.data.pagination.total);
    } catch (error) {
      setError('Failed to load bids');
      console.error('Fetch bids error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bidId) => {
    if (!window.confirm('Are you sure you want to delete this bid? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(bidId);
      await api.delete(`/admin/bids/${bidId}`);
      setBids(bids.filter(bid => bid._id !== bidId));
      alert('Bid deleted successfully');
    } catch (error) {
      alert('Failed to delete bid');
      console.error('Delete bid error:', error);
    } finally {
      setDeleting(null);
    }
  };

  const handleItemFilter = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return (
      <div className="admin-bids">
        <div className="loading">Loading bids...</div>
      </div>
    );
  }

  return (
    <div className="admin-bids">
      <div className="admin-header">
        <h1>Manage Bids</h1>
        <p>View and manage all auction bids</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Filter */}
      <div className="filter-section">
        <form onSubmit={handleItemFilter} className="filter-form">
          <input
            type="text"
            placeholder="Filter by item ID (optional)..."
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
            className="filter-input"
          />
          <button type="submit" className="btn btn-primary">Filter</button>
          {itemId && (
            <button 
              type="button" 
              onClick={() => {
                setItemId('');
                setCurrentPage(1);
              }}
              className="btn btn-secondary"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Bids Table */}
      <div className="bids-table-container">
        <table className="bids-table">
          <thead>
            <tr>
              <th>Bidder</th>
              <th>Item</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bids.map(bid => (
              <tr key={bid._id}>
                <td>
                  <div className="bidder-info">
                    <span className="bidder-name">{bid.bidder?.name || 'Unknown'}</span>
                    <span className="bidder-email">{bid.bidder?.email || 'No email'}</span>
                  </div>
                </td>
                <td>
                  <div className="item-info">
                    <Link to={`/item/${bid.item?._id}`} className="item-title">
                      {bid.item?.title || 'Unknown Item'}
                    </Link>
                    <span className="item-price">
                      Current: {formatAmount(bid.item?.currentBid || 0)}
                    </span>
                  </div>
                </td>
                <td>
                  <span className="bid-amount">{formatAmount(bid.amount)}</span>
                </td>
                <td>
                  <span className="bid-date">{formatDate(bid.createdAt)}</span>
                </td>
                <td>
                  <button
                    onClick={() => handleDelete(bid._id)}
                    disabled={deleting === bid._id}
                    className="btn btn-danger btn-sm"
                  >
                    {deleting === bid._id ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

      {bids.length === 0 && !loading && (
        <div className="no-data">
          <p>No bids found.</p>
        </div>
      )}
    </div>
  );
};

export default AdminBids;
