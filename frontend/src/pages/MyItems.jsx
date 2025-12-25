import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit, 
  Eye, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  MoreVertical,
  Gavel
} from 'lucide-react';

const MyItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, ended
  const [searchQuery, setSearchQuery] = useState('');

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
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'active' ? !isEnded :
      filter === 'ended' ? isEnded : true;
    
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const formatTimeLeft = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h ${Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Listings</h1>
            <p className="text-gray-500 mt-1">Manage and track your auction items</p>
          </div>
          <Link
            to="/create-item"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5 mr-2" /> Create New Item
          </Link>
        </div>

        {/* Stats Summary (Optional Enhancement) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Listed</p>
              <p className="text-2xl font-bold text-gray-900">{items.length}</p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
              <Gavel className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Auctions</p>
              <p className="text-2xl font-bold text-green-600">
                {items.filter(i => new Date(i.endTime) > new Date()).length}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl text-green-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
             <div>
              <p className="text-sm font-medium text-gray-500">Ended Auctions</p>
              <p className="text-2xl font-bold text-gray-600">
                 {items.filter(i => new Date(i.endTime) <= new Date()).length}
              </p>
            </div>
             <div className="p-3 bg-gray-100 rounded-xl text-gray-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Filter Tabs */}
            <div className="flex p-1 bg-gray-100 rounded-xl w-full md:w-auto">
              {['all', 'active', 'ended'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                    filter === type
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        )}

        {/* Content Area */}
        {filteredItems.length === 0 ? (
           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No items found</h3>
            <p className="text-gray-500">Try adjusting your filters or create a new listing.</p>
             {filter === 'all' && searchQuery === '' && (
                 <Link
                 to="/create-item"
                 className="inline-block mt-6 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
               >
                 Create Item
               </Link>
             )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => {
              const isEnded = new Date(item.endTime) < new Date();
              return (
                <div key={item._id} className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                  {/* Image Container */}
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    {item.images && item.images.length > 0 ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-sm">No Image</span>
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md ${
                        isEnded 
                          ? 'bg-gray-900/80 text-white' 
                          : 'bg-green-500/90 text-white'
                      }`}>
                        {isEnded ? (
                            <>
                                <XCircle className="w-3 h-3" /> Ended
                            </>
                        ) : (
                            <>
                                <Clock className="w-3 h-3" /> {formatTimeLeft(item.endTime)}
                            </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                         <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors" title={item.title}>
                            {item.title}
                        </h3>
                    </div>
                   
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[40px]">
                        {item.description}
                    </p>

                    <div className="mt-auto pt-4 border-t border-gray-50">
                        <div className="flex justify-between items-end mb-4">
                             <div>
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Current Bid</p>
                                <p className="text-xl font-bold text-indigo-600">
                                    ${item.currentBid || item.basePrice}
                                </p>
                             </div>
                             <div className="text-right">
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Bids</p>
                                <p className="text-lg font-semibold text-gray-700">{item.bidCount || 0}</p>
                             </div>
                        </div>

                        {/* Actions Grid */}
                        <div className="grid grid-cols-2 gap-2">
                            <Link
                                to={`/item/${item._id}`}
                                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                            >
                                <Eye className="w-4 h-4" /> View
                            </Link>
                            
                            {!isEnded ? (
                                <Link
                                    to={`/edit-item/${item._id}`}
                                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-600 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors"
                                >
                                    <Edit className="w-4 h-4" /> Edit
                                </Link>
                            ) : (
                                <Link
                                    to={`/seller/items/${item._id}/bids`}
                                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                                >
                                    <Gavel className="w-4 h-4" /> Bids
                                </Link>
                            )}

                             <button
                                onClick={() => handleDelete(item._id)}
                                className="col-span-2 flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" /> Delete Item
                            </button>
                        </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyItems;