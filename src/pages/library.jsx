// pages/Library.jsx
import React, { useState, useEffect, useRef } from "react";
import { 
  Search, Filter, Plus, Edit2, Trash2, Play, Pause, 
  BookOpen, Music, Film, FileText, X, Upload, Link2, 
  ChevronLeft, ChevronRight, Volume2, VolumeX, ExternalLink 
} from "lucide-react";
import { getLibrary, postLibrary, putLibrary, deleteLibrary } from "../services/library";

const Library = () => {
  // --- State for listing & search ---
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [contentTypeFilter, setContentTypeFilter] = useState("all");
  const [accessFilter, setAccessFilter] = useState("all");
  
  // --- State for pagination ---
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    per_page: 10,
    total_pages: 1,
  });

  // --- State for Modals ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  // --- Form State ---
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formContentType, setFormContentType] = useState("audio");
  const [formAccess, setFormAccess] = useState("free");
  const [coverMode, setCoverMode] = useState("url"); // 'url' or 'file'
  const [coverUrl, setCoverUrl] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [mediaMode, setMediaMode] = useState("url"); // 'url' or 'file'
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaFile, setMediaFile] = useState(null);

  // --- State for Preview Player ---
  const [previewItem, setPreviewItem] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  // --- Debounced Search ---
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [search]);

  // --- Fetch Library Items ---
  const fetchLibrary = async () => {
    try {
      setLoading(true);
      setError("");
      
      const params = {
        page: currentPage,
        per_page: pagination.per_page,
      };

      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }
      if (contentTypeFilter !== "all") {
        params.content_type = contentTypeFilter;
      }
      if (accessFilter !== "all") {
        params.access = accessFilter;
      }

      const res = await getLibrary(params);
      
      // Parse backend response defensively
      let fetchedItems = [];
      let total = 0;
      let totalPages = 1;

      if (Array.isArray(res)) {
        fetchedItems = res;
        total = res.length;
        totalPages = Math.ceil(total / pagination.per_page) || 1;
      } else if (res && res.library && Array.isArray(res.library)) {
        fetchedItems = res.library;
        total = res.total || res.library.length;
        totalPages = res.total_pages || Math.ceil(total / pagination.per_page) || 1;
      } else if (res && res.results && Array.isArray(res.results)) {
        fetchedItems = res.results;
        total = res.count || res.results.length;
        totalPages = Math.ceil(total / pagination.per_page) || 1;
      } else if (res && res.data && Array.isArray(res.data)) {
        fetchedItems = res.data;
        total = res.total || res.data.length;
        totalPages = res.total_pages || Math.ceil(total / pagination.per_page) || 1;
      }

      setItems(fetchedItems);
      setPagination(prev => ({
        ...prev,
        total: total,
        total_pages: totalPages,
      }));

    } catch (err) {
      console.error("Error fetching library:", err);
      setError(err.message || "Failed to load library resources.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, [currentPage, debouncedSearch, contentTypeFilter, accessFilter]);

  // --- Handle Preview Player ---
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.error("Error playing audio:", err);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, previewItem]);

  const handlePlayPause = (item) => {
    if (previewItem && previewItem.id === item.id) {
      setIsPlaying(!isPlaying);
    } else {
      setPreviewItem(item);
      setIsPlaying(true);
      setCurrentTime(0);
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleAudioLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const closePlayer = () => {
    setIsPlaying(false);
    setPreviewItem(null);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // --- Modal Forms Open/Reset ---
  const openAddModal = () => {
    setEditingItem(null);
    setFormTitle("");
    setFormDescription("");
    setFormContentType("audio");
    setFormAccess("free");
    setCoverMode("url");
    setCoverUrl("");
    setCoverFile(null);
    setMediaMode("url");
    setMediaUrl("");
    setMediaFile(null);
    setModalError("");
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormTitle(item.title || "");
    setFormDescription(item.description || "");
    setFormContentType(item.content_type || "audio");
    setFormAccess(item.access || "free");
    
    // Default edit mode: URL if file is not selected, but show previews if existing URLs exist
    setCoverMode("url");
    setCoverUrl(item.cover_url || "");
    setCoverFile(null);
    
    setMediaMode("url");
    setMediaUrl(item.file_url || "");
    setMediaFile(null);
    
    setModalError("");
    setIsModalOpen(true);
  };

  // --- Delete Item ---
  const handleDelete = async (item) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${item.title}"?`);
    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");
      await deleteLibrary(item.id);
      setSuccess("Resource deleted successfully!");
      
      // Stop player if the deleted item was playing
      if (previewItem && previewItem.id === item.id) {
        closePlayer();
      }

      fetchLibrary();
    } catch (err) {
      setError(err.message || "Failed to delete resource.");
    }
  };

  // --- Save / Submit Form ---
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setModalError("Title is required.");
      return;
    }

    try {
      setModalLoading(true);
      setModalError("");

      // Construct payload. We can send files via FormData or JSON.
      // Let's use FormData to support file uploads seamlessly.
      const formData = new FormData();
      formData.append("title", formTitle.trim());
      formData.append("description", formDescription.trim());
      formData.append("content_type", formContentType);
      formData.append("access", formAccess);

      // Cover image handling
      if (coverMode === "file" && coverFile) {
        formData.append("cover", coverFile);
      } else {
        // Send cover_url and cover as string URL
        formData.append("cover_url", coverUrl.trim());
        formData.append("cover", coverUrl.trim());
      }

      // Media file handling
      if (mediaMode === "file" && mediaFile) {
        formData.append("file", mediaFile);
      } else {
        // Send file_url and file as string URL
        formData.append("file_url", mediaUrl.trim());
        formData.append("file", mediaUrl.trim());
      }

      if (editingItem) {
        await putLibrary(editingItem.id, formData);
        setSuccess("Resource updated successfully!");
        
        // Refresh preview player if it was the currently editing item
        if (previewItem && previewItem.id === editingItem.id) {
          // Merge updated properties
          setPreviewItem({
            ...previewItem,
            title: formTitle.trim(),
            description: formDescription.trim(),
            content_type: formContentType,
            access: formAccess,
            cover_url: coverMode === "file" ? URL.createObjectURL(coverFile) : coverUrl.trim(),
            file_url: mediaMode === "file" ? URL.createObjectURL(mediaFile) : mediaUrl.trim()
          });
        }
      } else {
        await postLibrary(formData);
        setSuccess("New resource added successfully!");
      }

      setIsModalOpen(false);
      fetchLibrary();
    } catch (err) {
      console.error("Save error:", err);
      setModalError(err.message || "Failed to save resource. Please verify fields.");
    } finally {
      setModalLoading(false);
    }
  };

  const getContentTypeIcon = (type) => {
    switch (type) {
      case "audio":
        return <Music size={14} />;
      case "video":
        return <Film size={14} />;
      default:
        return <FileText size={14} />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-7 pb-[120px] relative">
      {/* Alerts */}
      {error && (
        <div className="mb-4 p-3 rounded-lg text-[12px] text-[#e57368] bg-[rgba(192,57,43,0.15)] border border-[rgba(192,57,43,0.3)]">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 rounded-lg text-[12px] text-[#2d5a3d] bg-[rgba(45,90,61,0.15)] border border-[rgba(45,90,61,0.3)]">
          {success}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[30px] font-semibold text-black font-serif">Library</h1>
          <p className="text-[13px] text-[#5a6b5e] mt-0.5">Manage Quranic supplications, audio, video, and text resources</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-[18px] py-[11px] bg-[#1a3a2a] hover:bg-[#2d5a3d] rounded-[10px] text-[13px] font-semibold text-white cursor-pointer transition-colors shadow-sm"
        >
          <Plus size={16} /> Add Resource
        </button>
      </div>

      {/* Search & Filtering */}
      <div className="flex gap-3 items-center mb-5 flex-wrap md:flex-nowrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888b88] pointer-events-none" />
          <input
            className="w-full pl-10 pr-3.5 py-[11px] border border-[#e8eae8] rounded-[10px] text-[13px] text-[#1a2a1e] bg-white outline-none focus:border-[#2d5a3d] transition-colors"
            placeholder="Search by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {loading && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] text-[#888b88]">
              Searching...
            </span>
          )}
        </div>

        {/* Content Type Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold tracking-[0.5px] uppercase text-[#888b88] whitespace-nowrap">Type:</span>
          <select
            value={contentTypeFilter}
            onChange={(e) => { setContentTypeFilter(e.target.value); setCurrentPage(1); }}
            className="text-[12px] text-[#5a6b5e] border border-[#e8eae8] rounded-[10px] px-3.5 py-[11px] bg-white cursor-pointer focus:border-[#2d5a3d] outline-none"
          >
            <option value="all">All Types</option>
            <option value="audio">Audio</option>
            <option value="video">Video</option>
            <option value="text">Text</option>
          </select>
        </div>

        {/* Access Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold tracking-[0.5px] uppercase text-[#888b88] whitespace-nowrap">Access:</span>
          <select
            value={accessFilter}
            onChange={(e) => { setAccessFilter(e.target.value); setCurrentPage(1); }}
            className="text-[12px] text-[#5a6b5e] border border-[#e8eae8] rounded-[10px] px-3.5 py-[11px] bg-white cursor-pointer focus:border-[#2d5a3d] outline-none"
          >
            <option value="all">All Access</option>
            <option value="free">Free</option>
            <option value="premium">Premium</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-[14px] border border-[#e8eae8] overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {["RESOURCE", "TYPE", "ACCESS", "UPLOADED BY", "ACTIONS"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold tracking-[0.8px] uppercase text-[#888b88] border-b border-[#e8eae8]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-[#f8faf8] transition-colors">
                {/* Resource Info */}
                <td className="px-5 py-3.5 border-b border-[#e8eae8]">
                  <div className="flex items-center gap-3 max-w-[450px]">
                    <div className="w-12 h-12 rounded-lg bg-[#f0f4f1] border border-[#e8eae8] overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {item.cover_url ? (
                        <img 
                          src={item.cover_url} 
                          alt={item.title} 
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <BookOpen size={16} className="text-[#5a6b5e]" />
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-[13px] font-semibold text-[#1a2a1e] truncate" title={item.title}>
                        {item.title}
                      </div>
                      <div className="text-[12px] text-[#5a6b5e] line-clamp-1" title={item.description}>
                        {item.description || "No description provided"}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Content Type */}
                <td className="px-5 py-3.5 border-b border-[#e8eae8]">
                  <span className="flex items-center gap-1 text-[12px] text-[#5a6b5e] capitalize">
                    {getContentTypeIcon(item.content_type)}
                    {item.content_type || "audio"}
                  </span>
                </td>

                {/* Access */}
                <td className="px-5 py-3.5 border-b border-[#e8eae8]">
                  <span className={`inline-block px-3 py-0.5 rounded-full text-[11px] font-semibold capitalize
                    ${item.access === "premium"
                      ? "bg-[rgba(201,168,76,0.15)] text-[#c9a84c]"
                      : "bg-[#f0f4f1] text-[#5a6b5e]"}`}>
                    {item.access || "free"}
                  </span>
                </td>

                {/* Uploaded By */}
                <td className="px-5 py-3.5 border-b border-[#e8eae8]">
                  <div className="text-[13px] text-[#1a2a1e] font-medium">{item.uploaded_by_name || "Admin"}</div>
                  <div className="text-[11px] text-[#888b88]">
                    {item.created_at ? new Date(item.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    }) : "N/A"}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-5 py-3.5 border-b border-[#e8eae8]">
                  <div className="flex items-center gap-2">
                    {/* Preview Button */}
                    {(item.content_type === "audio" || item.file_url) && (
                      <button
                        onClick={() => handlePlayPause(item)}
                        className={`p-1.5 rounded-lg border transition-colors flex items-center justify-center cursor-pointer
                          ${previewItem && previewItem.id === item.id && isPlaying
                            ? "bg-[#1a3a2a] text-white border-[#1a3a2a] hover:bg-[#2d5a3d]"
                            : "bg-white text-[#1a3a2a] border-[#e8eae8] hover:bg-[#f0f4f1]"}`}
                        title="Listen / Preview"
                      >
                        {previewItem && previewItem.id === item.id && isPlaying ? (
                          <Pause size={14} />
                        ) : (
                          <Play size={14} />
                        )}
                      </button>
                    )}
                    
                    {/* Edit Button */}
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 rounded-lg border border-[#e8eae8] bg-white text-[#5a6b5e] hover:bg-[#f0f4f1] hover:text-[#1a2a1e] transition-colors cursor-pointer"
                      title="Edit Resource"
                    >
                      <Edit2 size={14} />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-1.5 rounded-lg border border-[#e8eae8] bg-white text-[#e57368] hover:bg-[#fef2f2] transition-colors cursor-pointer"
                      title="Delete Resource"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-[#888b88] py-12 text-[13px]">
                  {search || contentTypeFilter !== 'all' || accessFilter !== 'all' 
                    ? "No resources found matching the criteria" 
                    : "No library resources available. Click 'Add Resource' to create one."}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Footer */}
        {pagination.total_pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#e8eae8]">
            <div className="text-[12px] text-[#5a6b5e]">
              Showing {Math.min((currentPage - 1) * pagination.per_page + 1, pagination.total)} to{" "}
              {Math.min(currentPage * pagination.per_page, pagination.total)} of {pagination.total} results
            </div>
            <div className="flex gap-1 items-center">
              <button 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="w-[30px] h-[30px] rounded-md border border-[#e8eae8] bg-white flex items-center justify-center text-[#5a6b5e] hover:bg-[#f0f4f1] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
              </button>
              
              {Array.from({ length: pagination.total_pages }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button 
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-[30px] h-[30px] rounded-md border text-[13px] flex items-center justify-center cursor-pointer transition-all
                      ${pageNum === currentPage
                        ? "bg-[#1a3a2a] text-white border-[#1a3a2a]"
                        : "bg-white text-[#5a6b5e] border-[#e8eae8] hover:bg-[#f0f4f1]"}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button 
                onClick={() => setCurrentPage(Math.min(pagination.total_pages, currentPage + 1))}
                disabled={currentPage === pagination.total_pages}
                className="w-[30px] h-[30px] rounded-md border border-[#e8eae8] bg-white flex items-center justify-center text-[#5a6b5e] hover:bg-[#f0f4f1] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- ADD / EDIT RESOURCE MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-[14px] border border-[#e8eae8] w-full max-w-[560px] max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-[#1a3a2a] px-6 py-4 flex items-center justify-between text-white sticky top-0 z-10">
              <h2 className="text-[16px] font-semibold">
                {editingItem ? "Edit Resource" : "Add New Resource"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/60 hover:text-white bg-transparent border-none cursor-pointer p-0.5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSave} className="p-6 flex-1 space-y-4">
              {modalError && (
                <div className="p-2.5 rounded-lg text-[12px] text-[#e57368] bg-[rgba(192,57,43,0.15)] border border-[rgba(192,57,43,0.3)]">
                  {modalError}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="text-[11px] font-semibold text-[#5a6b5e] uppercase tracking-[0.5px] block mb-1.5">
                  Title <span className="text-[#e57368]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 40 Rabbana - أدعية من القرآن"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#e8eae8] rounded-[10px] text-[13px] text-[#1a2a1e] bg-white outline-none focus:border-[#2d5a3d] transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[11px] font-semibold text-[#5a6b5e] uppercase tracking-[0.5px] block mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief description of the resource..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#e8eae8] rounded-[10px] text-[13px] text-[#1a2a1e] bg-white outline-none focus:border-[#2d5a3d] transition-colors resize-none"
                />
              </div>

              {/* Content Type & Access */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-[#5a6b5e] uppercase tracking-[0.5px] block mb-1.5">
                    Content Type
                  </label>
                  <select
                    value={formContentType}
                    onChange={(e) => setFormContentType(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#e8eae8] rounded-[10px] text-[13px] text-[#1a2a1e] bg-white outline-none focus:border-[#2d5a3d] transition-colors cursor-pointer"
                  >
                    <option value="audio">Audio Recitation</option>
                    <option value="video">Video Lecture</option>
                    <option value="text">Text / PDF Document</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#5a6b5e] uppercase tracking-[0.5px] block mb-1.5">
                    Access Level
                  </label>
                  <select
                    value={formAccess}
                    onChange={(e) => setFormAccess(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#e8eae8] rounded-[10px] text-[13px] text-[#1a2a1e] bg-white outline-none focus:border-[#2d5a3d] transition-colors cursor-pointer"
                  >
                    <option value="free">Free Access</option>
                    <option value="premium">Premium Access</option>
                  </select>
                </div>
              </div>

              {/* --- COVER IMAGE --- */}
              <div className="border border-[#e8eae8] rounded-xl p-3 bg-[#f8faf8]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-[#1a3a2a] uppercase tracking-[0.5px]">
                    Cover Image
                  </span>
                  <div className="flex gap-1 bg-white border border-[#e8eae8] rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => setCoverMode("url")}
                      className={`px-2 py-1 text-[11px] rounded font-medium border-none cursor-pointer flex items-center gap-1 transition-colors
                        ${coverMode === "url" ? "bg-[#1a3a2a] text-white" : "bg-transparent text-[#5a6b5e] hover:bg-[#f0f4f1]"}`}
                    >
                      <Link2 size={10} /> URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoverMode("file")}
                      className={`px-2 py-1 text-[11px] rounded font-medium border-none cursor-pointer flex items-center gap-1 transition-colors
                        ${coverMode === "file" ? "bg-[#1a3a2a] text-white" : "bg-transparent text-[#5a6b5e] hover:bg-[#f0f4f1]"}`}
                    >
                      <Upload size={10} /> File Upload
                    </button>
                  </div>
                </div>

                {coverMode === "url" ? (
                  <div className="space-y-2">
                    <input
                      type="url"
                      placeholder="e.g. https://domain.com/image.jpg"
                      value={coverUrl}
                      onChange={(e) => setCoverUrl(e.target.value)}
                      className="w-full px-3.5 py-2 border border-[#e8eae8] rounded-lg text-[13px] text-[#1a2a1e] bg-white outline-none focus:border-[#2d5a3d] transition-colors"
                    />
                    {coverUrl && (
                      <div className="mt-2 flex items-center gap-3">
                        <img 
                          src={coverUrl} 
                          alt="Cover Preview" 
                          className="w-12 h-12 rounded object-cover border border-[#e8eae8]"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <span className="text-[11px] text-[#5a6b5e] truncate max-w-[300px]">{coverUrl}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center border-2 border-dashed border-[#e8eae8] rounded-lg p-4 bg-white hover:bg-[#f8faf8] transition-colors relative cursor-pointer group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setCoverFile(e.target.files[0])}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <div className="text-center">
                        <Upload size={18} className="mx-auto text-[#5a6b5e] group-hover:text-[#1a3a2a] mb-1.5 transition-colors" />
                        <span className="text-[11px] text-[#5a6b5e] font-medium block">
                          {coverFile ? coverFile.name : "Click to select Cover Image"}
                        </span>
                      </div>
                    </div>
                    {coverFile && (
                      <div className="mt-2 flex items-center gap-3">
                        <img 
                          src={URL.createObjectURL(coverFile)} 
                          alt="Cover Preview" 
                          className="w-12 h-12 rounded object-cover border border-[#e8eae8]" 
                        />
                        <span className="text-[11px] text-[#2d5a3d] font-semibold">Image selected ready to upload</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* --- MEDIA RESOURCE FILE --- */}
              <div className="border border-[#e8eae8] rounded-xl p-3 bg-[#f8faf8]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-[#1a3a2a] uppercase tracking-[0.5px]">
                    Media File (Audio/Video/Doc)
                  </span>
                  <div className="flex gap-1 bg-white border border-[#e8eae8] rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => setMediaMode("url")}
                      className={`px-2 py-1 text-[11px] rounded font-medium border-none cursor-pointer flex items-center gap-1 transition-colors
                        ${mediaMode === "url" ? "bg-[#1a3a2a] text-white" : "bg-transparent text-[#5a6b5e] hover:bg-[#f0f4f1]"}`}
                    >
                      <Link2 size={10} /> URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setMediaMode("file")}
                      className={`px-2 py-1 text-[11px] rounded font-medium border-none cursor-pointer flex items-center gap-1 transition-colors
                        ${mediaMode === "file" ? "bg-[#1a3a2a] text-white" : "bg-transparent text-[#5a6b5e] hover:bg-[#f0f4f1]"}`}
                    >
                      <Upload size={10} /> File Upload
                    </button>
                  </div>
                </div>

                {mediaMode === "url" ? (
                  <div className="space-y-2">
                    <input
                      type="url"
                      placeholder="e.g. https://domain.com/media-file.mp3"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      className="w-full px-3.5 py-2 border border-[#e8eae8] rounded-lg text-[13px] text-[#1a2a1e] bg-white outline-none focus:border-[#2d5a3d] transition-colors"
                    />
                    {mediaUrl && (
                      <div className="text-[11px] text-[#5a6b5e] truncate flex items-center gap-1">
                        <ExternalLink size={10} />
                        <span className="truncate">{mediaUrl}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center border-2 border-dashed border-[#e8eae8] rounded-lg p-4 bg-white hover:bg-[#f8faf8] transition-colors relative cursor-pointer group">
                      <input
                        type="file"
                        accept="audio/*,video/*,application/pdf"
                        onChange={(e) => setMediaFile(e.target.files[0])}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <div className="text-center">
                        <Upload size={18} className="mx-auto text-[#5a6b5e] group-hover:text-[#1a3a2a] mb-1.5 transition-colors" />
                        <span className="text-[11px] text-[#5a6b5e] font-medium block">
                          {mediaFile ? mediaFile.name : "Click to select Media File"}
                        </span>
                      </div>
                    </div>
                    {mediaFile && (
                      <div className="mt-2 text-[11px] text-[#2d5a3d] font-semibold">
                        File selected ready to upload ({Math.round(mediaFile.size / 1024 / 1024 * 100) / 100} MB)
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={modalLoading}
                  className="flex-1 px-4 py-2.5 border border-[#e8eae8] rounded-[10px] text-[13px] font-semibold text-[#5a6b5e] bg-white hover:bg-[#f0f4f1] transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="flex-1 px-4 py-2.5 bg-[#1a3a2a] hover:bg-[#2d5a3d] rounded-[10px] text-[13px] font-semibold text-white transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {modalLoading ? "Saving..." : "Save Resource"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- PREMIUM BOTTOM AUDIO PREVIEW PLAYER --- */}
      {previewItem && (
        <div className="fixed bottom-0 left-[240px] right-0 bg-[#1a3a2a] text-white border-t border-[#c9a84c]/20 px-6 py-4 flex items-center justify-between z-40 shadow-2xl animate-slide-up">
          <audio
            ref={audioRef}
            src={previewItem.file_url}
            onTimeUpdate={handleAudioTimeUpdate}
            onLoadedMetadata={handleAudioLoadedMetadata}
            onEnded={handleAudioEnded}
          />

          {/* Left: Metadata */}
          <div className="flex items-center gap-3 max-w-[30%]">
            <div className="w-12 h-12 rounded bg-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center border border-white/10">
              {previewItem.cover_url ? (
                <img 
                  src={previewItem.cover_url} 
                  alt={previewItem.title} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <Music size={16} className="text-white/70" />
              )}
            </div>
            <div className="overflow-hidden">
              <div className="text-[13px] font-semibold truncate leading-normal" title={previewItem.title}>
                {previewItem.title}
              </div>
              <div className="text-[11px] text-white/50 truncate capitalize">
                {previewItem.content_type || "audio"} • {previewItem.access || "free"}
              </div>
            </div>
          </div>

          {/* Center: Controls & Time Slider */}
          <div className="flex flex-col items-center flex-1 max-w-[45%] px-4">
            <div className="flex items-center gap-4 mb-1.5">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-8 h-8 rounded-full bg-white text-[#1a3a2a] hover:bg-[#c9a84c] hover:text-white transition-colors flex items-center justify-center cursor-pointer border-none"
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
              </button>
            </div>
            
            <div className="w-full flex items-center gap-2">
              <span className="text-[10px] text-white/50 w-8 text-right">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#c9a84c] focus:outline-none"
              />
              <span className="text-[10px] text-white/50 w-8">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Right: Volume & Close */}
          <div className="flex items-center gap-4">
            {/* Volume Toggle */}
            <button
              onClick={toggleMute}
              className="text-white/60 hover:text-white bg-transparent border-none cursor-pointer p-1 transition-colors"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            {/* Separator */}
            <div className="w-px h-5 bg-white/10" />

            {/* Close Player */}
            <button
              onClick={closePlayer}
              className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/25 hover:text-white text-white/60 transition-colors flex items-center justify-center cursor-pointer border-none"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;
