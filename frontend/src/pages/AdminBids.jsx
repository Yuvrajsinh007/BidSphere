import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

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
    if (!window.confirm('Are you sure you want to delete this bid? This action cannot be undone.')) return;

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

  const formatAmount = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  const formatDate = (date) => new Date(date).toLocaleString();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="text-gray-500 text-lg">Loading bids...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-bold text-gray-800">Manage Bids</h1>
        <p className="text-gray-500">View and manage all auction bids</p>
      </div>

      {error && <div className="text-red-500 text-center">{error}</div>}

      {/* Filter */}
      {/* <form onSubmit={handleItemFilter} className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto mb-6">
        <input
          type="text"
          placeholder="Filter by item ID (optional)..."
          value={itemId}
          onChange={(e) => setItemId(e.target.value)}
          className="flex-1 p-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
        />
        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition">
          Filter
        </button>
        {itemId && (
          <button
            type="button"
            onClick={() => { setItemId(''); setCurrentPage(1); }}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-medium transition"
          >
            Clear
          </button>
        )}
      </form> */}

      {/* Bids Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-gray-700 font-semibold">Bidder</th>
              <th className="px-4 py-2 text-left text-gray-700 font-semibold">Item</th>
              <th className="px-4 py-2 text-left text-gray-700 font-semibold">Amount</th>
              <th className="px-4 py-2 text-left text-gray-700 font-semibold">Date</th>
              <th className="px-4 py-2 text-left text-gray-700 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bids.map(bid => (
              <tr key={bid._id} className="hover:bg-gray-50">
                <td className="px-4 py-2">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-800">{bid.bidder?.name || 'Unknown'}</span>
                    <span className="text-gray-500 text-sm">{bid.bidder?.email || 'No email'}</span>
                  </div>
                </td>
                <td className="px-4 py-2">
                  <div className="flex flex-col">
                    <Link to={`/item/${bid.item?._id}`} className="font-medium text-gray-800 hover:text-blue-500">{bid.item?.title || 'Unknown Item'}</Link>
                    <span className="text-gray-500 text-sm">Current: {formatAmount(bid.item?.currentBid || 0)}</span>
                  </div>
                </td>
                <td className="px-4 py-2 font-semibold text-green-600">{formatAmount(bid.amount)}</td>
                <td className="px-4 py-2 text-gray-500 text-sm">{formatDate(bid.createdAt)}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleDelete(bid._id)}
                    disabled={deleting === bid._id}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium disabled:opacity-50"
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
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-6">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            Previous
          </button>
          <span className="font-medium text-gray-700">Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {bids.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500 text-lg">No bids found.</div>
      )}
    </div>
  );
};

export default AdminBids;
