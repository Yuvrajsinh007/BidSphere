import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import { 
  Package, ShoppingBag, Gavel, Trophy, CreditCard, 
  Plus, List, Clock, DollarSign
} from 'lucide-react';

// --- SELLER DASHBOARD COMPONENT ---
const SellerDashboard = ({ user }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data } = await api.get('/items/my-items');
        setItems(data);
      } catch (error) {
        console.error("Fetch items error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  // 1. Sort items by date (Newest First) to ensure "Recent Inventory" is correct
  const sortedItems = [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // 2. Calculate Stats based on the fetched items
  const activeItems = items.filter(i => i.status === 'active').length;
  const soldItems = items.filter(i => i.status === 'sold').length;
  
  // Calculate revenue only from items that are actually marked as 'sold'
  const totalRevenue = items
    .filter(i => i.status === 'sold')
    .reduce((acc, curr) => acc + (curr.currentBid || curr.basePrice || 0), 0);

  // 3. Get the latest 5 items for the list
  const recentInventory = sortedItems.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Seller Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">{activeItems}</h3>
            <p className="text-gray-500">Active Listings</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">{soldItems}</h3>
            <p className="text-gray-500">Items Sold</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
            <DollarSign className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">${totalRevenue.toLocaleString()}</h3>
            <p className="text-gray-500">Total Revenue</p>
          </div>
        </div>
      </div>

      {/* Seller Actions */}
      <div className="flex gap-4">
        <Link to="/create-item" className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center gap-2">
          <Plus className="w-5 h-5" /> Create New Auction
        </Link>
        <Link to="/my-items" className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition flex items-center gap-2">
          <List className="w-5 h-5" /> Manage Inventory
        </Link>
      </div>

      {/* Recent Inventory (Latest 5 Items) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Recent Inventory</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {recentInventory.length > 0 ? (
            recentInventory.map(item => (
              <div key={item._id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  {/* Image with fallback */}
                  <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    {item.images && item.images.length > 0 ? (
                      <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package size={20} />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800">{item.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        item.status === 'active' ? 'bg-green-100 text-green-700' : 
                        item.status === 'sold' ? 'bg-blue-100 text-blue-700' : 
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {item.status.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-bold text-indigo-600">${item.currentBid || item.basePrice}</p>
                  <p className="text-xs text-gray-500">
                    {item.status === 'sold' ? 'Sold Price' : 'Current Bid'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="p-6 text-center text-gray-500">No items listed yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// --- BUYER DASHBOARD COMPONENT ---
const BuyerDashboard = ({ user }) => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const { data } = await api.get('/bids/my-bids');
        setBids(data);
      } catch (error) {
        console.error("Fetch bids error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBids();
  }, []);

  const activeBids = bids.filter(b => b.item && b.item.status === 'active');
  const wonAuctions = bids.filter(b => b.item && b.item.status === 'sold' && b.item.winner === user._id);

  // Deduplicate won items
  const uniqueWonMap = new Map();
  wonAuctions.forEach(bid => {
      const existing = uniqueWonMap.get(bid.item._id);
      if (!existing || bid.amount > existing.amount) {
          uniqueWonMap.set(bid.item._id, bid);
      }
  });
  const uniqueWonItems = Array.from(uniqueWonMap.values());

  const totalSpent = uniqueWonItems.reduce((acc, curr) => {
      const price = curr.item.currentBid || curr.amount; 
      return acc + price;
  }, 0);

  return (
    <div className="space-y-8">
       {/* Buyer Stats */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
            <Gavel className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">{activeBids.length}</h3>
            <p className="text-gray-500">Active Bids</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">{uniqueWonItems.length}</h3>
            <p className="text-gray-500">Auctions Won</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
            <CreditCard className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">${totalSpent}</h3>
            <p className="text-gray-500">Total Spent</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Link to="/" className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" /> Browse Auctions
        </Link>
      </div>

      {/* Recent Bids */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Recent Bidding History</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {bids.slice(0, 5).map(bid => (
            <div key={bid._id} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-4">
                {bid.item ? (
                  <>
                      <img src={bid.item.images?.[0]} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-200" />
                      <div>
                        <h4 className="font-semibold text-gray-800">{bid.item.title}</h4>
                        <p className="text-xs text-gray-500">
                          {new Date(bid.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                  </>
                ) : (
                  <div className="text-gray-400 italic">Item Deleted</div>
                )}
               
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">${bid.amount}</p>
                <div className="text-xs">
                  {bid.item?.status === 'active' && <span className="text-amber-600 flex items-center justify-end gap-1"><Clock size={12}/> Active</span>}
                  {bid.item?.status === 'sold' && bid.item.winner === user._id && <span className="text-green-600 flex items-center justify-end gap-1"><Trophy size={12}/> Won</span>}
                  {bid.item?.status === 'sold' && bid.item.winner !== user._id && <span className="text-gray-500">Ended</span>}
                </div>
              </div>
            </div>
          ))}
          {bids.length === 0 && <p className="p-6 text-center text-gray-500">No bids placed yet.</p>}
        </div>
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD CONTAINER ---
const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back, {user.name}</p>
      </div>

      {user.role === 'Seller' ? <SellerDashboard user={user} /> : <BuyerDashboard user={user} />}
    </div>
  );
};

export default Dashboard;