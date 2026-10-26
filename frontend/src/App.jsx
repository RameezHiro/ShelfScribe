import { useState, useEffect, useCallback } from 'react';

function App() {
  const [images, setImages] = useState([]);
  const [keywords, setKeywords] = useState('');
  const [productType, setProductType] = useState('');
  const [listing, setListing] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copyToast, setCopyToast] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);

  // Track mount state for staggered entrance animations
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Create object URLs for image previews
  const imagePreviews = images.map((file) => URL.createObjectURL(file));

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const handleSubmit = useCallback(async () => {
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
  }, [images, keywords, productType]);

  const handleImageUpload = useCallback((e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setError(`"${file.name}" is not an image file.`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError(`"${file.name}" exceeds 10MB limit.`);
        continue;
      }
      validFiles.push(file);
    }

    if (images.length + validFiles.length > 5) {
      setError("Maximum 5 images allowed. Remove some first.");
      return;
    }

    setImages((prev) => [...prev, ...validFiles]);
    setError(null);
  }, [images.length]);

  const removeImage = useCallback((index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    // Only deactivate if leaving the actual drop zone
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files.length) {
      handleImageUpload({ target: { files: e.dataTransfer.files } });
    }
  }, [handleImageUpload]);

  const copyToClipboard = useCallback(async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyToast(label);
      setTimeout(() => setCopyToast(null), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-ground)] font-body text-[var(--color-ink)] selection:bg-[var(--color-accentSoft)] selection:text-[var(--color-accent)] overflow-x-hidden">
      {/* Header */}
      <header className="max-w-editorial mx-auto px-[var(--space-margin-page)] py-6 flex items-center justify-between bg-[var(--color-surfaceElevated)]/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[var(--color-accent)] rounded-sm flex items-center justify-center text-[var(--color-accentInk)] font-bold">S</div>
          <div>
            <h2 className="font-display text-heading-md font-bold tracking-tight leading-none">ShelfScribe</h2>
            <p className="text-caption-sm text-[var(--color-inkMuted)] uppercase tracking-wider">AI Listing Studio</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 text-caption-sm text-[var(--color-inkSoft)] px-3 py-1 bg-[var(--color-surface)] rounded-full">
            <span className="w-2 h-2 bg-[var(--color-success)] rounded-full"></span>
            Local-first AI
          </span>
        </div>
      </header>

      <main className="max-w-editorial mx-auto px-[var(--space-margin-page)] py-[var(--space-section-md)]">
        {/* Hero Section */}
        <section className={`mb-[var(--space-section-lg)] text-center max-w-prose mx-auto transition-all duration-[var(--duration-page)] ease-editorial ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h1 className="font-display text-display-xl mb-4 leading-display">
            Your products deserve <span className="text-[var(--color-accent)] italic">better words.</span>
          </h1>
          <p className="text-body-lg text-[var(--color-inkSoft)]">
            Transform product photography into SEO-optimized Etsy listings instantly. Powered by local AI for your privacy.
          </p>
        </section>

        {/* Main Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[var(--space-margin-wide)] items-start">

          {/* Left: Product Photography */}
          <div className={`lg:col-span-7 space-y-[var(--space-gap-card)] transition-all duration-[var(--duration-page)] ease-editorial delay-1 ${isMounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
            <div className="bg-[var(--color-surface)] p-[var(--space-gap-card)] rounded-2xl bg-[var(--color-surfaceElevated)]/30">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-heading-lg">Product Photography</h2>
                <span className="text-caption-sm font-medium text-[var(--color-inkMuted)]">{images.length}/5 photos</span>
              </div>

              {/* Upload Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg bg-[var(--color-ground)]/50 p-12 transition-colors duration-normal ease-editorial ${
                  isDragActive || images.length === 0
                    ? 'block'
                    : 'hidden'
                } ${isDragActive ? 'border-[var(--color-accent)] bg-[var(--color-accentSoft)]' : 'border-[var(--color-inkMuted)]/30 group hover:border-[var(--color-accent)] hover:bg-[var(--color-accentSoft)]/30'}`}
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-[var(--color-surface)] rounded-full flex items-center justify-center mx-auto text-[var(--color-inkMuted)] group-hover:text-[var(--color-accent)] transition-colors duration-normal">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-body font-medium">Click to select or drag and drop</p>
                    <p className="text-caption text-[var(--color-inkMuted)]">High-resolution JPEG or PNG up to 5 images</p>
                  </div>
                </div>
              </div>

              {/* Gallery View */}
              {images.length > 0 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className="group relative aspect-square rounded-lg overflow-hidden bg-[var(--color-surfaceElevated)] border border-[var(--color-inkMuted)]/10"
                      >
                        <img
                          src={imagePreviews[idx]}
                          alt="Product preview"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-slow"
                        />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute top-2 right-2 w-8 h-8 bg-[var(--color-surface)]/90 rounded-full flex items-center justify-center text-[var(--color-danger)] hover:bg-[var(--color-danger)] hover:text-white transition-colors duration-fast"
                          aria-label="Remove image"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    {images.length < 5 && (
                      <div className="relative aspect-square border-2 border-dashed border-[var(--color-inkMuted)]/20 rounded-lg hover:border-[var(--color-accent)] hover:bg-[var(--color-accentSoft)]/20 transition-colors duration-normal flex flex-center">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="m-auto text-[var(--color-inkMuted)]">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Listing Configuration */}
          <div className={`lg:col-span-5 space-y-[var(--space-gap-card)] transition-all duration-[var(--duration-page)] ease-editorial delay-2 ${isMounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            <div className="bg-[var(--color-surface)] p-[var(--space-gap-card)] rounded-2xl bg-[var(--color-surfaceElevated)]/30">
              <h2 className="font-display text-heading-lg mb-6">Listing Details</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-caption-sm font-bold uppercase tracking-wider text-[var(--color-inkMuted)] mb-2">Product Type</label>
                  <input
                    type="text"
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    placeholder="e.g. Handmade Ceramic Mug"
                    className="w-full bg-[var(--color-ground)]/30 focus:border-[var(--color-accent)] focus:ring-[var(--color-accentSoft)]/30 rounded-md px-4 py-3 text-body focus:outline-none"
                  />
                  <p className="text-caption-sm text-[var(--color-inkMuted)] mt-1.5 italic">Essential for categorical accuracy</p>
                </div>

                <div>
                  <label className="block text-caption-sm font-bold uppercase tracking-wider text-[var(--color-inkMuted)] mb-2">Keywords</label>
                  <textarea
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="e.g. boho, rustic, gift for her, kitchen decor"
                    rows={3}
                    className="w-full bg-[var(--color-ground)]/30 focus:border-[var(--color-accent)] focus:ring-[var(--color-accentSoft)]/30 rounded-md px-4 py-3 text-body resize-none focus:outline-none"
                  />
                  <p className="text-caption-sm text-[var(--color-inkMuted)] mt-1.5 italic">Comma-separated tags for SEO</p>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading || images.length === 0}
                    className="w-full py-4 px-6 bg-[var(--color-accent)] text-[var(--color-accentInk)] rounded-lg font-bold text-body hover:bg-[var(--color-accentHover)] transition-colors duration-normal disabled:opacity-30 relative overflow-hidden"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-3">
                        <span className="w-5 h-5 border-2 border-[var(--color-accentInk)]/30 border-t-[var(--color-accentInk)] rounded-full animate-spin" style={{ animation: 'spin 0.8s linear infinite' }}></span>
                        Analyzing studio...
                      </span>
                    ) : (
                      'Generate Etsy Listing'
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="mt-6 p-4 bg-[var(--color-dangerSoft)]/50 border border-[var(--color-danger)]/20 rounded-lg flex items-start gap-3">
                  <svg className="w-5 h-5 text-[var(--color-danger)] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-body-sm text-[var(--color-danger)] font-medium">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Generated Listing Result */}
        {listing && (
          <section className="mt-[var(--space-section-lg)] transition-all duration-[var(--duration-page)] ease-editorial animate-fade-in">
            <div className="bg-[var(--color-surface)] rounded-2xl overflow-hidden">
              <div className="bg-[var(--color-surfaceElevated)] px-[var(--space-gap-card)] py-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[var(--color-terracottaSoft)] text-[var(--color-terracotta)] rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h2 className="font-display text-heading-xl">Studio Output</h2>
                </div>
                <button
                  onClick={() => copyToClipboard(`${listing.title}\n\n${listing.description}\n\nTags: ${listing.tags}`, "All Content")}
                  className="btn btn-secondary btn-sm"
                >
                  Copy All
                </button>
              </div>

              <div className="p-[var(--space-gap-card)] space-y-[var(--space-section-xs)]">
                {/* Title Card */}
                <div className="group space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-caption-sm font-bold uppercase tracking-wider text-[var(--color-inkMuted)]">SEO Title</h3>
                    <button
                      onClick={() => copyToClipboard(listing.title, "Title")}
                      className="text-caption-sm font-bold text-[var(--color-accent)] hover:underline"
                    >
                      Copy Title
                    </button>
                  </div>
                  <div className="p-5 bg-[var(--color-ground)]/30 rounded-lg text-heading-md font-display font-medium leading-relaxed">
                    {listing.title}
                  </div>
                </div>

                {/* Description Card */}
                <div className="group space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-caption-sm font-bold uppercase tracking-wider text-[var(--color-inkMuted)]">Description</h3>
                    <button
                      onClick={() => copyToClipboard(listing.description, "Description")}
                      className="text-caption-sm font-bold text-[var(--color-accent)] hover:underline"
                    >
                      Copy Description
                    </button>
                  </div>
                  <div className="p-6 bg-[var(--color-ground)]/30 rounded-lg text-body whitespace-pre-wrap leading-body text-[var(--color-inkSoft)]">
                    {listing.description}
                  </div>
                </div>

                {/* Tags & Price */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-[var(--space-gap-card)]">
                  <div className="md:col-span-8 space-y-3">
                    <h3 className="text-caption-sm font-bold uppercase tracking-wider text-[var(--color-inkMuted)]">Recommended Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {listing.tags.split(',').map((tag, i) => (
                        <span key={i} className="px-3 py-1 bg-[var(--color-surfaceElevated)] text-body-sm rounded-full text-[var(--color-inkSoft)]">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-4 space-y-3">
                    <h3 className="text-caption-sm font-bold uppercase tracking-wider text-[var(--color-inkMuted)]">Market Price Range</h3>
                    <div className="p-4 bg-[var(--color-terracottaSoft)]/30 rounded-lg text-heading-md font-display text-[var(--color-terracotta)] text-center">
                      {listing.price_range}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Copy Toast */}
      {copyToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[var(--z-toast)] animate-fade-in bg-[var(--color-ink)] text-white px-6 py-3 rounded-full flex items-center gap-3">
          <svg className="w-5 h-5 text-[var(--color-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-body-sm font-bold">{copyToast} copied to clipboard</span>
        </div>
      )}

      {/* Footer */}
      <footer className="max-w-editorial mx-auto px-[var(--space-margin-page)] py-[var(--space-section-md)] bg-[var(--color-surfaceElevated)]/50 text-center space-y-4">
        <p className="text-caption text-[var(--color-inkMuted)]">
          © 2026 ShelfScribe Studio. Designed for the creative economy.
        </p>
        <div className="flex items-center justify-center gap-6">
          <span className="w-1.5 h-1.5 bg-[var(--color-inkMuted)]/30 rounded-full"></span>
          <span className="text-caption-sm text-[var(--color-inkMuted)] font-medium uppercase tracking-widest">Privacy First</span>
          <span className="w-1.5 h-1.5 bg-[var(--color-inkMuted)]/30 rounded-full"></span>
          <span className="text-caption-sm text-[var(--color-inkMuted)] font-medium uppercase tracking-widest">Local Processing</span>
          <span className="w-1.5 h-1.5 bg-[var(--color-inkMuted)]/30 rounded-full"></span>
        </div>
      </footer>
    </div>
  );
}

export default App;