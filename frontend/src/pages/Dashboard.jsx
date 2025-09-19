import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalItems: 0,
    activeBids: 0,
    wonAuctions: 0,
    totalSpent: 0,
  });
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [itemsResponse, bidsResponse] = await Promise.all([
        api.get("/items"),
        api.get("/bids/my-bids"),
      ]);

      const items = itemsResponse.data;
      const bids = bidsResponse.data;

      const totalItems = items.length;
      const activeBids = bids.filter(
        (bid) => new Date(bid.item.endTime) > new Date()
      ).length;
      const wonAuctions = bids.filter(
        (bid) =>
          new Date(bid.item.endTime) < new Date() &&
          bid.amount === Math.max(...bid.item.bids.map((b) => b.amount))
      ).length;
      const totalSpent = bids.reduce((sum, bid) => sum + bid.amount, 0);

      setStats({ totalItems, activeBids, wonAuctions, totalSpent });
      setRecentItems(items.slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center text-lg font-semibold text-gray-600">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Welcome back, {user.name}!
        </h1>
        <p className="text-gray-500 text-lg">
          Here's what's happening with your auctions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-xl p-6 shadow-md flex items-center gap-4 hover:shadow-xl transition">
          <div className="text-white text-3xl w-14 h-14 flex items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600">
            📦
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">
              {stats.totalItems}
            </h3>
            <p className="text-gray-500 font-medium">Total Items</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md flex items-center gap-4 hover:shadow-xl transition">
          <div className="text-white text-3xl w-14 h-14 flex items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600">
            🎯
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">
              {stats.activeBids}
            </h3>
            <p className="text-gray-500 font-medium">Active Bids</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md flex items-center gap-4 hover:shadow-xl transition">
          <div className="text-white text-3xl w-14 h-14 flex items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600">
            🏆
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">
              {stats.wonAuctions}
            </h3>
            <p className="text-gray-500 font-medium">Won Auctions</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md flex items-center gap-4 hover:shadow-xl transition">
          <div className="text-white text-3xl w-14 h-14 flex items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600">
            💰
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">
              ${stats.totalSpent.toLocaleString()}
            </h3>
            <p className="text-gray-500 font-medium">Total Spent</p>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="grid gap-10">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Quick Actions
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            
            <Link
              to="/"
              className="bg-gradient-to-tr from-gray-100 to-gray-200 rounded-lg p-6 text-center hover:shadow-lg hover:-translate-y-1 transition"
            >
              <div className="text-2xl mb-3">🔍</div>
              <h3 className="text-lg font-semibold text-gray-800">
                Browse Auctions
              </h3>
              <p className="text-sm text-gray-500">Find items to bid on</p>
            </Link>
            {user.role === "Seller" && (
              <>
                <Link
                  to="/create-item"
                  className="bg-gradient-to-tr from-gray-100 to-gray-200 rounded-lg p-6 text-center hover:shadow-lg hover:-translate-y-1 transition"
                >
                  <div className="text-2xl mb-3">➕</div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Create Item
                  </h3>
                  <p className="text-sm text-gray-500">
                    List a new item for auction
                  </p>
                </Link>

                <Link
                  to="/my-items"
                  className="bg-gradient-to-tr from-gray-100 to-gray-200 rounded-lg p-6 text-center hover:shadow-lg hover:-translate-y-1 transition"
                >
                  <div className="text-2xl mb-3">📋</div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    My Items
                  </h3>
                  <p className="text-sm text-gray-500">
                    Manage your listed items
                  </p>
                </Link>
              </>
            )}
            {user.role === "Buyer" && (
              <>  
                <Link
                  to="/dashboard/bids"
                  className="bg-gradient-to-tr from-gray-100 to-gray-200 rounded-lg p-6 text-center hover:shadow-lg hover:-translate-y-1 transition"
                >
                  <div className="text-2xl mb-3">📊</div>
                  <h3 className="text-lg font-semibold text-gray-800">My Bids</h3>
                  <p className="text-sm text-gray-500">View your bidding history</p>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Recent Items */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Recent Items
            </h2>
            <Link
              to="/"
              className="text-indigo-500 font-semibold hover:text-purple-600 transition"
            >
              View All
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            {recentItems.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="mb-4 text-lg">
                  No items found. Start browsing auctions!
                </p>
                <Link
                  to="/"
                  className="px-5 py-2 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
                >
                  Browse Auctions
                </Link>
              </div>
            ) : (
              recentItems.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                    {item.images && item.images.length > 0 ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500 text-xs">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-md font-semibold text-gray-800">
                      {item.title}
                    </h3>
                    <p className="text-green-600 font-bold">
                      ${item.currentBid || item.basePrice}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(item.endTime) > new Date()
                        ? `Ends in ${Math.ceil(
                            (new Date(item.endTime) - new Date()) /
                              (1000 * 60 * 60 * 24)
                          )} days`
                        : "Auction ended"}
                    </p>
                  </div>
                  <Link
                    to={`/item/${item._id}`}
                    className="px-3 py-1 rounded-md bg-indigo-50 text-indigo-600 font-medium hover:bg-indigo-100 transition"
                  >
                    View
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
