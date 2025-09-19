import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const MyItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, ended

  useEffect(() => {
    fetchMyItems();
  }, []);

  const fetchMyItems = async () => {
    try {
      setLoading(true);
      const response = await api.get('/seller/items');
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
      setError('Failed to load your items');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await api.delete(`/seller/items/${itemId}`);
      setItems(items.filter(item => item._id !== itemId));
    } catch (error) {
      setError('Failed to delete item');
    }
  };

  const filteredItems = items.filter(item => {
    const isEnded = new Date(item.endTime) < new Date();
    switch (filter) {
      case 'active':
        return !isEnded;
      case 'ended':
        return isEnded;
      default:
        return true;
    }
  });

  const formatTimeLeft = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;

    if (diff <= 0) return 'Auction ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const getStatusBadge = (item) => {
    const isEnded = new Date(item.endTime) < new Date();
    return (
      <span
        className={`absolute top-2 left-2 px-3 py-1 rounded-full text-xs font-semibold text-white ${
          isEnded ? 'bg-gray-600' : 'bg-green-600'
        }`}
      >
        {isEnded ? 'Ended' : 'Active'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8 text-center text-gray-600">
        Loading your items...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center border-b-2 border-gray-100 pb-6 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Auction Items</h1>
          <p className="text-gray-500 text-lg">Manage your listed items and track their performance</p>
        </div>
        <Link
          to="/create-item"
          className="mt-4 md:mt-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-xl hover:-translate-y-1 transition"
        >
          + Create New Item
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-4 mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-3">
        {['all', 'active', 'ended'].map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-5 py-2.5 rounded-lg font-semibold transition border-2 ${
              filter === type
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-indigo-500'
                : 'bg-white border-gray-200 text-gray-500 hover:border-indigo-400 hover:text-indigo-500'
            }`}
          >
            {type === 'all'
              ? `All Items (${items.length})`
              : type === 'active'
              ? `Active (${items.filter(i => new Date(i.endTime) > new Date()).length})`
              : `Ended (${items.filter(i => new Date(i.endTime) < new Date()).length})`}
          </button>
        ))}
      </div>

      {/* No Items */}
      {filteredItems.length === 0 ? (
        <div className="text-center p-10 bg-white rounded-xl shadow">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">No items found</h3>
          <p className="text-gray-500 mb-6">
            {filter === 'all'
              ? "You haven't listed any items yet. Start by creating your first auction!"
              : filter === 'active'
              ? "You don't have any active auctions at the moment."
              : "You don't have any ended auctions yet."}
          </p>
          {filter === 'all' && (
            <Link
              to="/create-item"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Create Your First Item
            </Link>
          )}
        </div>
      ) : (
        /* Items Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <div
              key={item._id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition hover:-translate-y-1 overflow-hidden"
            >
              {/* Image */}
              <div className="relative h-52 bg-gray-100 flex items-center justify-center">
                {item.images && item.images.length > 0 ? (
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400">No Image</span>
                )}
                {getStatusBadge(item)}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{item.title}</h3>
                <p className="text-indigo-500 font-medium text-sm mb-4">{item.category}</p>

                {/* Stats */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Current Price:</span>
                    <span className="text-gray-800 font-semibold">
                      ${item.currentBid || item.basePrice}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Bids:</span>
                    <span className="text-gray-800 font-semibold">{item.bidCount || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Time Left:</span>
                    <span
                      className={`font-semibold ${
                        new Date(item.endTime) < new Date() ? 'text-gray-500' : 'text-gray-800'
                      }`}
                    >
                      {formatTimeLeft(item.endTime)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Link
                    to={`/item/${item._id}`}
                    className="px-3 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    View Details
                  </Link>
                  <Link
                    to={`/seller/items/${item._id}/bids`}
                    className="px-3 py-2 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700"
                  >
                    View Bids
                  </Link>
                  {new Date(item.endTime) > new Date() && (
                    <Link
                      to={`/edit-item/${item._id}`}
                      className="px-3 py-2 rounded-md text-sm font-medium bg-yellow-400 text-gray-900 hover:bg-yellow-500"
                    >
                      Edit
                    </Link>
                  )}
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="px-3 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyItems;
