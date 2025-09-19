import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
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
    if (!window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) return;

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

    if (item.status === 'sold') return <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase bg-cyan-200 text-cyan-800">Sold</span>;
    if (item.status === 'closed') return <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase bg-yellow-100 text-yellow-800">Closed</span>;
    if (endTime <= now) return <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase bg-red-200 text-red-800">Expired</span>;
    return <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase bg-green-200 text-green-800">Active</span>;
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
      <div className="flex justify-center items-center h-64">
        <span className="text-gray-500 text-lg">Loading items...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Manage Items</h1>
        <p className="text-gray-500 text-lg">View and manage all auction items</p>
      </div>

      {/* Error */}
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-6">{error}</div>}

      {/* Filters */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto flex-wrap">
          <input
            type="text"
            placeholder="Search items by title..."
            ref={searchInputRef}
            defaultValue={search}
            onChange={(e) => debouncedSearch(e.target.value)}
            className="flex-1 min-w-[200px] p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-300"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="flex-1 min-w-[200px] p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-300"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="ended">Ended</option>
          </select>
        </form>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {items.map(item => (
          <div key={item._id} className="bg-white rounded-xl shadow hover:shadow-lg transition-transform transform hover:-translate-y-1 overflow-hidden">
            <div className="h-48 w-full overflow-hidden relative">
              {item.images && item.images.length > 0 ? (
                <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 text-lg">
                  No Image
                </div>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-1">{item.title}</h3>
              <p className="text-gray-500 text-sm mb-1">Seller: {item.seller?.name || 'Unknown'}</p>
              <p className="text-green-600 font-semibold mb-1">Current Bid: ${item.currentBid || item.basePrice}</p>
              <p className="text-gray-600 text-sm mb-2">Ends: {new Date(item.endTime).toLocaleDateString()}</p>

              <div className="flex justify-between items-center mb-4">
                {getStatusBadge(item)}
                {item.status === 'active' && (
                  <span className="text-red-600 font-semibold text-sm">{formatTimeRemaining(item.endTime)}</span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Link
                  to={`/item/${item._id}`}
                  className="flex-1 text-center px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm font-medium"
                >
                  View Details
                </Link>
                <button
                  onClick={() => handleDelete(item._id)}
                  disabled={deleting === item._id}
                  className="flex-1 text-center px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-medium disabled:opacity-50"
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
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-6">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="font-semibold text-gray-700">Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* No Data */}
      {items.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500 text-lg">
          No items found.
        </div>
      )}
    </div>
  );
};

export default AdminItems;
