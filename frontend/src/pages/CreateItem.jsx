import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const CreateItem = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    basePrice: "",
    auctionDuration: "24",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);

  const categories = [
    "Electronics",
    "Fashion",
    "Home & Garden",
    "Sports",
    "Books",
    "Collectibles",
    "Art",
    "Jewelry",
    "Automotive",
    "Other",
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreview(previews);
  };

  const removeImage = (index) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    setImageFiles(newFiles);
    setImagePreview(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Use FormData to send both text data and files
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("category", formData.category);
      data.append("basePrice", formData.basePrice);
      data.append("auctionDuration", formData.auctionDuration);

      // Append all selected images
      imageFiles.forEach((file) => {
        data.append("images", file);
      });

      // Send single request to create item with images
      await api.post("/seller/items", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      navigate("/my-items");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create item");
      console.error("Create item error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="bg-white shadow-lg rounded-2xl p-8">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-indigo-600">
            Create New Auction Item
          </h1>
          <p className="text-gray-500">List your item for auction</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-100 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Basic Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Item Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Enter item title"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  placeholder="Describe your item"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Duration */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Pricing & Duration
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Base Price ($) *
                </label>
                <input
                  type="number"
                  name="basePrice"
                  value={formData.basePrice}
                  onChange={handleChange}
                  required
                  min="0.01"
                  step="0.01"
                  placeholder="Enter starting price"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Auction Duration *
                </label>
                <select
                  name="auctionDuration"
                  value={formData.auctionDuration}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="1">1 hour</option>
                  <option value="6">6 hours</option>
                  <option value="12">12 hours</option>
                  <option value="24">1 day</option>
                  <option value="48">2 days</option>
                  <option value="72">3 days</option>
                  <option value="168">1 week</option>
                </select>
              </div>
            </div>
          </div>

          {/* Images */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Images</h3>
            <p className="text-sm text-gray-500 mb-2">
              First image will be the main display image. You can add up to 5 images.
            </p>

            <input
              type="file"
              id="images"
              name="images"
              onChange={handleImageChange}
              multiple
              accept="image/*"
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
            />

            {imagePreview.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-2">Image Preview</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imagePreview.map((preview, index) => (
                    <div
                      key={index}
                      className="relative border rounded-lg overflow-hidden"
                    >
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full px-2 py-1 text-xs"
                      >
                        ×
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-1 left-1 bg-indigo-600 text-white text-xs px-2 py-0.5 rounded">
                          Main
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate("/my-items")}
              className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Auction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateItem;