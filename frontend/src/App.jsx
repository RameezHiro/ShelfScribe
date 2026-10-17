import { useState } from 'react';

function App() {
  const [images, setImages] = useState([]);
  const [keywords, setKeywords] = useState('');
  const [productType, setProductType] = useState('');
  const [listing, setListing] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    const formData = new FormData();
    images.forEach((img) => formData.append("files", img));
    if (keywords) formData.append("keywords", keywords);
    if (productType) formData.append("productType", productType);

    try {
      const response = await fetch("/api/generate-listing", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setListing(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  [caption] => (
      <div className="border p-3 mb-3">
        <img
          src={URL.createObjectURL(blob)}
          alt="Preview"
          className="max-w-xs mb-2"
        />
        <button
          onClick={() => setImages(images.filter((_, i) => i !== idx))}
          className="text-sm text-red-600"
        >
          Remove
        </button>
      </div>
    )}
  </div>

  <div className="space-y-4">
    <label className="block text-sm font-medium mb-1">
      Keywords (optional)
    </label>
    <input
      type="text"
      value={keywords}
      onChange={(e) => setKeywords(e.target.value)}
      placeholder="e.g., boho, ceramic, mug, gift for her"
      className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
    />
  </div>

  <div className="space-y-4">
    <label className="block text-sm font-medium mb-1">
      Product Type (optional)
    </label>
    <input
      type="text"
      value={productType}
      onChange={(e) => setProductType(e.target.value)}
      placeholder="e.g., jewelry, home decor, clothing"
      className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
    />
  </div>

  <button
    onClick={handleSubmit}
    disabled={isLoading || images.length === 0}
    className="w-full bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
  >
    {isLoading ? 'Generating...' : 'Generate Listing'}
  </button>

  {error && (
    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-800">
      <p>Error: {error}</p>
    </div>
  )}

  {listing && (
    <div className="mt-6 p-4 bg-gray-50 border rounded">
      <h2 className="text-xl font-bold mb-2">Generated Listing</h2>
      
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          value={listing.title}
          onChange={(e) => setListing({...listing, title: e.target.value})}
          className="w-full border rounded px-3 py-2"
        />
      </div>
      
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={listing.description}
          onChange={(e) => setListing({...listing, description: e.target.value})}
          rows={4}
          className="w-full border rounded px-3 py-2"
        />
      </div>
      
      <div className="flex items-center gap-3 mb-3">
        <div>
          <label className="block text-sm font-medium mb-1">Tags</label>
          <input
            type="text"
            value={listing.tags}
            onChange={(e) => setListing({...listing, tags: e.target.value})}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Price Range</label>
          <input
            type="text"
            value={listing.price_range}
            onChange={(e) => setListing({...listing, price_range: e.target.value})}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>
      
      <div className="flex gap-3">
        <button
          onClick={() => navigator.clipboard.writeText(listing.title)}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-3 rounded"
        >
          Copy Title
        </button>
        <button
          onClick={() => navigator.clipboard.writeText(listing.description)}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-3 rounded"
        >
          Copy Description
        </button>
        <button
          onClick={() => navigator.clipboard.writeText(`${listing.title}\n\n${listing.description}\n\nTags: ${listing.tags}\nPrice: ${listing.price_range}`)}
          className="bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700"
        >
          Copy All
        </button>
      </div>
    </div>
  )}
</div>
</div>
</div>
</main>
);
}

export default App;
