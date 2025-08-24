import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import debounce from '../utils/debounce';

const Home = () => {
  const { user, loading } = useAuth();
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('active');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const searchInputRef = useRef(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoadingItems(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        search: searchTerm,
        category: category,
        status: status
      });
      
      const response = await api.get(`/items?${params}`);
      setItems(response.data.items);
      setTotalPages(response.data.pagination.total);
      setHasNext(response.data.pagination.hasNext);
      setHasPrev(response.data.pagination.hasPrev);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoadingItems(false);
    }
  }, [currentPage, searchTerm, category, status]);
  
  // Create debounced search function
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
      setCurrentPage(1);
    }, 500),
    []
  );

  useEffect(() => {
    if (user) {
      fetchItems();
    }
  }, [user, fetchItems]);

  // Redirect to login if not authenticated
  if (!loading && !user) {
    return <Navigate to="/login" />;
  }

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setCurrentPage(1);
  };

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
    const now = new Date();
    const endTime = new Date(item.endTime);
    
    if (item.status === 'sold') {
      return <span className="text-green-600 bg-green-50">Sold</span>;
    } else if (item.status === 'closed') {
      return <span className="text-gray-600 bg-gray-50">Closed</span>;
    } else if (endTime <= now) {
      return <span className="text-red-600 bg-red-50">Expired</span>;
    } else {
      return <span className="text-blue-600 bg-blue-50">Active</span>;
    }
  };

  if (loadingItems) {
    return (
      <div className="max-w-6xl mx-auto p-8 text-center">
        <div className="text-lg text-gray-500">Loading auctions...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Hero Section */}
      <div className="text-center mb-12 py-12 bg-gradient-to-br from-gray-100 to-gray-300 rounded-2xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to BidSphere</h1>
        <p className="text-lg text-gray-600">Discover unique items and place your bids</p>
      </div>

      {/* Filters */}
      <div className="mb-7">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[260px]">
            <input
              type="text"
              placeholder="Search items..."
              ref={searchInputRef}
              defaultValue={searchTerm}
              onChange={(e) => debouncedSearch(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex gap-4">
            <select
              value={category}
              onChange={handleCategoryChange}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-base bg-white cursor-pointer focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Fashion">Fashion</option>
              <option value="Home & Garden">Home & Garden</option>
              <option value="Sports">Sports</option>
              <option value="Books">Books</option>
              <option value="Collectibles">Collectibles</option>
              <option value="Art">Art</option>
              <option value="Jewelry">Jewelry</option>
              <option value="Automotive">Automotive</option>
              <option value="Other">Other</option>
            </select>

            <select
              value={status}
              onChange={handleStatusChange}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-base bg-white cursor-pointer focus:outline-none focus:border-indigo-500"
            >
              <option value="active">Active</option>
              <option value="ended">Ended</option>
              <option value="">All</option>
            </select>


          </div>
        </form>
      </div>

      {/* Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.length === 0 ? (
          <div className="col-span-full text-center p-12 text-gray-500">
            <h3 className="text-xl font-semibold mb-2">No items found</h3>
            <p>Try adjusting your search criteria</p>
          </div>
        ) : (
          items.map(item => (
            <div
              key={item._id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transform hover:-translate-y-1 transition"
            >
              {/* Item Image */}
              <div className="relative h-52 overflow-hidden">
                {item.images && item.images.length > 0 ? (
                  <img
                    src={`http://localhost:5000${item.images[0]}`}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 text-lg">
                    No Image
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-indigo-500 text-white text-xs px-3 py-1 rounded-full">
                  {item.category}
                </div>
                <div className="absolute top-2 left-2">
                  {getStatusBadge(item)}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>

                <div className="flex justify-between items-center mb-4">
                  <div>
                    <span className="text-xl font-bold text-green-600">
                      ${item.currentBid || item.basePrice}
                    </span>
                    {item.currentBid && (
                      <span className="text-sm text-gray-400 line-through ml-2">
                        Base: ${item.basePrice}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium px-3 py-1 rounded-full ${
                      new Date(item.endTime) < new Date()
                        ? 'text-gray-400 bg-gray-100'
                        : 'text-red-600 bg-red-50'
                    }`}
                  >
                    {formatTimeLeft(item.endTime)}
                  </span>
                </div>

                <div className="text-sm text-gray-500 mb-4">
                  Seller: {item.seller?.name || 'Unknown'}
                </div>

                <Link
                  to={`/item/${item._id}`}
                  className="block w-full py-3 text-center rounded-lg font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-[1.02] transition"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center gap-4">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={!hasPrev}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={!hasNext}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
