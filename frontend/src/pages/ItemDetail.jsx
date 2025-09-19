import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

const ItemDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchItemDetails();
  }, [id]);

  const fetchItemDetails = async () => {
    try {
      setLoading(true);
      const [itemResponse, bidsResponse] = await Promise.all([
        api.get(`/items/${id}`),
        api.get(`/items/${id}/bids`),
      ]);

      setItem(itemResponse.data);
      setBids(bidsResponse.data);
    } catch (error) {
      console.error("Error fetching item details:", error);
      setError("Failed to load item details");
    } finally {
      setLoading(false);
    }
  };

  const handleBid = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!user) {
      navigate("/login");
      return;
    }

    const amount = parseFloat(bidAmount);
    if (!amount || amount <= 0) {
      setError("Please enter a valid bid amount");
      return;
    }

    const currentPrice = item.currentBid || item.basePrice;
    if (amount <= currentPrice) {
      setError(`Bid must be higher than $${currentPrice}`);
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.post(`/bids/${id}`, { amount });
      setSuccess(response.data.message || "Bid placed successfully!");
      setBidAmount("");
      fetchItemDetails();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to place bid");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimeLeft = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;

    if (diff <= 0) return "Auction ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const isAuctionEnded = item && new Date(item.endTime) < new Date();
  const isAuctionActive = item && item.status === 'active' && !isAuctionEnded;
  const canBid = user && isAuctionActive && user.role === "Buyer" && !user.isBanned;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center text-gray-600">Loading item details...</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-red-500 text-center">Item not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
        {/* Image Section */}
        <div className="flex flex-col gap-4">
          <div className="w-full h-96 rounded-xl overflow-hidden shadow-lg">
            {item.images && item.images.length > 0 ? (
              <img
                src={item.images[currentImageIndex]}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 text-lg">
                No Image Available
              </div>
            )}
          </div>

          {item.images && item.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto py-2">
              {item.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${item.title} ${index + 1}`}
                  className={`w-20 h-20 rounded-lg object-cover cursor-pointer border-2 transition ${
                    index === currentImageIndex
                      ? "border-indigo-500 shadow-md"
                      : "border-transparent"
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Item Info */}
        <div className="flex flex-col gap-8">
          <div className="flex justify-between items-start gap-4">
            <h1 className="text-4xl font-bold text-gray-800">{item.title}</h1>
            <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
              {item.category}
            </span>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-500 font-medium">Current Price:</span>
              <span className="text-3xl font-bold text-green-600">
                ${item.currentBid || item.basePrice}
              </span>
            </div>
            {item.currentBid && (
              <div className="text-sm text-gray-400 line-through">
                Base Price: ${item.basePrice}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-md">
            <div
              className={`text-sm font-semibold px-4 py-2 rounded-full ${
                isAuctionEnded
                  ? "text-gray-400 bg-gray-100"
                  : "text-red-500 bg-red-50"
              }`}
            >
              {formatTimeLeft(item.endTime)}
            </div>
            <div className="text-gray-500 text-sm font-medium">
              {bids.length} bid{bids.length !== 1 ? "s" : ""}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Seller Information
            </h3>
            <p className="text-gray-600">
              <strong>Name:</strong> {item.seller?.name || 'Unknown'}<br />
              <strong>Email:</strong> {item.seller?.email || 'Not provided'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Description
            </h3>
            <p className="text-gray-600 leading-relaxed">{item.description}</p>
          </div>

          {/* Bidding Section */}
          {canBid && (
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Place Your Bid
              </h3>
              {error && (
                <div className="bg-red-100 text-red-600 border border-red-200 p-3 rounded mb-3 text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-100 text-green-700 border border-green-200 p-3 rounded mb-3 text-sm">
                  {success}
                </div>
              )}

              <form onSubmit={handleBid} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="bidAmount"
                    className="font-semibold text-gray-700 text-sm"
                  >
                    Bid Amount ($)
                  </label>
                  <input
                    type="number"
                    id="bidAmount"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    min={
                      item.currentBid
                        ? item.currentBid + 1
                        : item.basePrice + 1
                    }
                    step="0.01"
                    required
                    disabled={submitting}
                    className="p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring focus:ring-indigo-200 disabled:opacity-50"
                    placeholder={`Min: $${
                      item.currentBid ? item.currentBid + 1 : item.basePrice + 1
                    }`}
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:-translate-y-1 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Placing Bid..." : "Place Bid"}
                </button>
              </form>
            </div>
          )}

          {isAuctionEnded && (
            <div className="bg-gray-100 p-6 rounded-xl border border-gray-300 text-center">
              <h3 className="text-gray-500 font-semibold mb-2">
                🕐 Auction Ended
              </h3>
              <p className="text-gray-600">
                This auction has ended. Check the bid history below.
              </p>
              {item.winner && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-green-700 font-semibold">
                    Winner: {item.winner.name}
                  </p>
                </div>
              )}
            </div>
          )}

          {!user && (
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-6 rounded-xl border border-indigo-400 text-center">
              <h3 className="text-gray-800 font-semibold mb-2">Want to bid?</h3>
              <p className="text-gray-600 mb-3">
                Please log in to place your bid.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-md hover:-translate-y-1 transition"
              >
                Login to Bid
              </button>
            </div>
          )}

          {user && user.isBanned && (
            <div className="bg-red-100 p-6 rounded-xl border border-red-300 text-center">
              <h3 className="text-red-700 font-semibold mb-2">
                Account Suspended
              </h3>
              <p className="text-red-600">
                Your account has been suspended. You cannot place bids.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bid History */}
      <div className="bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Bid History
        </h2>
        {bids.length === 0 ? (
          <p className="text-center text-gray-500 italic py-6">
            No bids yet. Be the first to bid!
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {bids.map((bid) => (
              <div
                key={bid._id}
                className="flex justify-between items-center p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-800">
                    {bid.bidder.name}
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    ${bid.amount}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(bid.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemDetail;