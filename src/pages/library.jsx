// pages/Library.jsx
import React, { useState, useEffect, useRef } from "react";
import { 
  Search, Plus, Edit2, Trash2, Play, Pause, 
  BookOpen, Music, FileText, X, Upload, 
  ChevronLeft, ChevronRight, Volume2, VolumeX, RefreshCw 
} from "lucide-react";
import { getLibrary, postLibrary, putLibrary, deleteLibrary } from "../services/library";

const Library = () => {
  // --- State for listing & search ---
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [contentTypeFilter, setContentTypeFilter] = useState("all");
  const [accessFilter, setAccessFilter] = useState("all");
  
  // --- State for pagination ---
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

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
  const [coverFile, setCoverFile] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);

  // --- State for Preview Player ---
  const [previewItem, setPreviewItem] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  const fetchLibrary = async () => {
    try {
      if (items.length === 0) {
        setLoading(true);
      }
      setError("");
      
      const query = {};
      if (contentTypeFilter !== "all") query.type = contentTypeFilter;
      if (accessFilter !== "all") query.access = accessFilter;

      const res = await getLibrary(query);
      setItems(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Error fetching library:", err);
      setError(err.message || "Failed to load library resources.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, [contentTypeFilter, accessFilter]);

  // Client-side search filter
  useEffect(() => {
    let result = [...items];
    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.title?.toLowerCase().includes(term) ||
          item.description?.toLowerCase().includes(term)
      );
    }
    setFilteredItems(result);
    setCurrentPage(1);
  }, [search, items]);

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

  const openAddModal = () => {
    setEditingItem(null);
    setFormTitle("");
    setFormDescription("");
    setFormContentType("audio");
    setFormAccess("free");
    setCoverFile(null);
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
    setCoverFile(null);
    setMediaFile(null);
    setModalError("");
    setIsModalOpen(true);
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${item.title}"?`);
    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");
      await deleteLibrary(item.id);
      setSuccess("Resource deleted successfully!");
      if (previewItem && previewItem.id === item.id) {
        closePlayer();
      }
      fetchLibrary();
    } catch (err) {
      setError(err.message || "Failed to delete resource.");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setModalError("Title is required.");
      return;
    }

    if (!editingItem && !mediaFile) {
      setModalError("Please select a resource file to upload.");
      return;
    }

    try {
      setModalLoading(true);
      setModalError("");

      const formData = new FormData();
      formData.append("title", formTitle.trim());
      formData.append("description", formDescription.trim());
      formData.append("content_type", formContentType);
      formData.append("access", formAccess);

      if (coverFile) {
        formData.append("cover_image", coverFile);
      }
      if (mediaFile) {
        formData.append("file", mediaFile);
      }

      if (editingItem) {
        await putLibrary(editingItem.id, formData);
        setSuccess("Resource updated successfully!");
      } else {
        await postLibrary(formData);
        setSuccess("New resource added successfully!");
      }

      setIsModalOpen(false);
      fetchLibrary();
    } catch (err) {
      console.error("Save error:", err);
      setModalError(err.message || "Failed to save resource. Please check file formats.");
    } finally {
      setModalLoading(false);
    }
  };

  const getContentTypeIcon = (type) => {
    switch (type) {
      case "audio":
        return <Music size={14} />;
      case "pdf":
        return <FileText size={14} />;
      case "book":
        return <BookOpen size={14} />;
      default:
        return <FileText size={14} />;
    }
  };

  // Pagination calculations
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / perPage) || 1;
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  return (
    <div className="flex-1 overflow-y-auto p-7 pb-[120px] relative bg-[#f4f6f4] dark:bg-[#070b09] transition-colors duration-200">
      {/* Alerts */}
      {error && (
        <div className="mb-4 p-3 rounded-lg text-[12px] text-[#e57368] bg-[rgba(192,57,43,0.15)] border border-[rgba(192,57,43,0.3)] dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 rounded-lg text-[12px] text-[#2d5a3d] bg-[rgba(45,90,61,0.15)] border border-[rgba(45,90,61,0.3)] dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400">
          {success}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[30px] font-semibold text-black dark:text-white font-serif">LIBRARY</h1>
          <p className="text-[13px] text-[#5a6b5e] dark:text-[#8ea094] mt-0.5">Manage Quranic supplications, audio, book, and PDF resources</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchLibrary}
            className="p-2.5 rounded-lg border border-[#e8eae8] dark:border-[#1c3225] bg-white dark:bg-[#0d1611] text-[#5a6b5e] dark:text-[#8ea094] hover:bg-[#f0f4f1] dark:hover:bg-[#16271f] transition-colors cursor-pointer"
            title="Refresh Library"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-[18px] py-[11px] bg-[#1a3a2a] dark:bg-[#2d5a3d] hover:bg-[#2d5a3d] dark:hover:bg-[#34bd65] rounded-[10px] text-[13px] font-semibold text-white dark:text-[#0d1611] cursor-pointer transition-colors shadow-sm"
          >
            <Plus size={16} /> Add Resource
          </button>
        </div>
      </div>

      {/* Search & Filtering */}
      <div className="flex gap-3 items-center mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888b88] dark:text-[#5a6b5e] pointer-events-none" />
          <input
            className="w-full pl-10 pr-3.5 py-[11px] border border-[#e8eae8] dark:border-[#1c3225] rounded-[10px] text-[13px] text-[#1a2a1e] dark:text-white bg-white dark:bg-[#0d1611] outline-none focus:border-[#2d5a3d] dark:focus:border-[#4ade80] transition-colors"
            placeholder="Search by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Content Type Filter */}
        <select
          value={contentTypeFilter}
          onChange={(e) => setContentTypeFilter(e.target.value)}
          className="text-[12px] text-[#5a6b5e] dark:text-[#8ea094] border border-[#e8eae8] dark:border-[#1c3225] rounded-[10px] px-3.5 py-[11px] bg-white dark:bg-[#0d1611] cursor-pointer focus:border-[#2d5a3d] dark:focus:border-[#4ade80] outline-none"
        >
          <option value="all">All Types</option>
          <option value="audio">Audio</option>
          <option value="pdf">PDF</option>
          <option value="book">Book</option>
        </select>

        {/* Access Filter */}
        <select
          value={accessFilter}
          onChange={(e) => setAccessFilter(e.target.value)}
          className="text-[12px] text-[#5a6b5e] dark:text-[#8ea094] border border-[#e8eae8] dark:border-[#1c3225] rounded-[10px] px-3.5 py-[11px] bg-white dark:bg-[#0d1611] cursor-pointer focus:border-[#2d5a3d] dark:focus:border-[#4ade80] outline-none"
        >
          <option value="all">All Access</option>
          <option value="free">Free</option>
          <option value="premium">Premium</option>
        </select>
      </div>

      {/* Table Container with Glassmorphism */}
      <div className="bg-white/70 dark:bg-[#0d1611]/75 border border-[#e8eae8]/80 dark:border-[#1c3225] rounded-[14px] overflow-hidden backdrop-blur-md shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["RESOURCE", "TYPE", "ACCESS", "UPLOADED BY", "ACTIONS"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold tracking-[0.8px] uppercase text-[#888b88] dark:text-[#5a6b5e] border-b border-[#e8eae8]/80 dark:border-[#1c3225]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((item) => (
                <tr key={item.id} className="hover:bg-[#f8faf8]/50 dark:hover:bg-[#121f18]/50 transition-colors">
                  <td className="px-5 py-3.5 border-b border-[#e8eae8]/80 dark:border-[#1c3225]">
                    <div className="flex items-center gap-3 max-w-[450px]">
                      <div className="w-16 h-16 rounded-lg bg-[#f0f4f1] dark:bg-[#16271f] border border-[#e8eae8] dark:border-[#1c3225] overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {item.cover_url ? (
                          <img 
                            src={item.cover_url} 
                            alt={item.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          getContentTypeIcon(item.content_type)
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-[13px] font-semibold text-[#1a2a1e] dark:text-white truncate" title={item.title}>
                          {item.title}
                        </div>
                        <div className="text-[12px] text-[#5a6b5e] dark:text-[#8ea094] line-clamp-1" title={item.description}>
                          {item.description || "No description provided"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 border-b border-[#e8eae8]/80 dark:border-[#1c3225]">
                    <span className="flex items-center gap-1 text-[12px] text-[#5a6b5e] dark:text-[#8ea094] capitalize">
                      {getContentTypeIcon(item.content_type)}
                      {item.content_type || "audio"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 border-b border-[#e8eae8]/80 dark:border-[#1c3225]">
                    <span className={`inline-block px-3 py-0.5 rounded-full text-[11px] font-bold border capitalize
                      ${item.access === "premium"
                        ? "bg-amber-100 dark:bg-[#2d220a] text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-900/50"
                        : "bg-emerald-100 dark:bg-[#0c2214] text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-900/50"}`}>
                      {item.access || "free"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 border-b border-[#e8eae8]/80 dark:border-[#1c3225]">
                    <div className="text-[13px] text-[#1a2a1e] dark:text-white font-medium">{item.uploaded_by_name || "Admin"}</div>
                    <div className="text-[11px] text-[#888b88] dark:text-[#5a6b5e]">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : "N/A"}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 border-b border-[#e8eae8]/80 dark:border-[#1c3225]">
                    <div className="flex items-center gap-2">
                      {item.file_url && (
                        <button
                          onClick={() => handlePlayPause(item)}
                          className={`p-1.5 rounded-lg border transition-colors flex items-center justify-center cursor-pointer
                            ${previewItem && previewItem.id === item.id && isPlaying
                              ? "bg-[#1a3a2a] text-white border-[#1a3a2a] hover:bg-[#2d5a3d]"
                              : "bg-white dark:bg-[#0d1611] text-[#1a3a2a] dark:text-[#4ade80] border-[#e8eae8] dark:border-[#1c3225] hover:bg-[#f0f4f1] dark:hover:bg-[#16271f]"}`}
                          title={item.content_type === "audio" ? "Listen / Preview" : "View Resource File"}
                        >
                          {previewItem && previewItem.id === item.id && isPlaying ? (
                            <Pause size={14} />
                          ) : (
                            <Play size={14} />
                          )}
                        </button>
                      )}
                      
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-lg border border-[#e8eae8] dark:border-[#1c3225] bg-white dark:bg-[#0d1611] text-[#5a6b5e] dark:text-[#8ea094] hover:bg-[#f0f4f1] dark:hover:bg-[#16271f] hover:text-[#1a2a1e] dark:hover:text-white transition-colors cursor-pointer"
                        title="Edit Resource"
                      >
                        <Edit2 size={14} />
                      </button>

                      <button
                        onClick={() => handleDelete(item)}
                        className="p-1.5 rounded-lg border border-[#e8eae8] dark:border-[#1c3225] bg-white dark:bg-[#0d1611] text-[#e57368] dark:text-red-400 hover:bg-[#fef2f2] dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                        title="Delete Resource"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {paginatedItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-[#888b88] py-12 text-[13px]">
                    {search || contentTypeFilter !== 'all' || accessFilter !== 'all' 
                      ? "No resources found matching the criteria" 
                      : "No library resources available. Click 'Add Resource' to upload one."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#e8eae8]/80 dark:border-[#1c3225]">
            <div className="text-[12px] text-[#5a6b5e] dark:text-[#8ea094]">
              Showing {Math.min((currentPage - 1) * perPage + 1, totalItems)} to{" "}
              {Math.min(currentPage * perPage, totalItems)} of {totalItems} results
            </div>
            <div className="flex gap-1 items-center">
              <button 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="w-[30px] h-[30px] rounded-md border border-[#e8eae8] dark:border-[#1c3225] bg-white dark:bg-[#0d1611] flex items-center justify-center text-[#5a6b5e] dark:text-[#8ea094] hover:bg-[#f0f4f1] dark:hover:bg-[#16271f] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button 
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-[30px] h-[30px] rounded-md border text-[13px] flex items-center justify-center cursor-pointer transition-all
                      ${pageNum === currentPage
                        ? "bg-[#1a3a2a] dark:bg-[#2d5a3d] text-white dark:text-[#0d1611] border-[#1a3a2a] dark:border-[#2d5a3d]"
                        : "bg-white dark:bg-[#0d1611] text-[#5a6b5e] dark:text-[#8ea094] border-[#e8eae8] dark:border-[#1c3225] hover:bg-[#f0f4f1] dark:hover:bg-[#16271f]"}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button 
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="w-[30px] h-[30px] rounded-md border border-[#e8eae8] dark:border-[#1c3225] bg-white dark:bg-[#0d1611] flex items-center justify-center text-[#5a6b5e] dark:text-[#8ea094] hover:bg-[#f0f4f1] dark:hover:bg-[#16271f] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="bg-white rounded-[14px] border border-[#e8eae8] w-full max-w-[520px] max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            
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
                  placeholder="e.g. Surah Al-Fatihah"
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
                    <option value="pdf">PDF Document</option>
                    <option value="book">Book / Translation</option>
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

              {/* Cover Image Upload */}
              <div className="border border-[#e8eae8] rounded-xl p-3 bg-[#f8faf8]">
                <label className="text-[11px] font-semibold text-[#1a3a2a] uppercase tracking-[0.5px] block mb-1.5">
                  Cover Image (Optional)
                </label>
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
                      {coverFile ? coverFile.name : "Choose Cover Image File"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Media File Upload */}
              <div className="border border-[#e8eae8] rounded-xl p-3 bg-[#f8faf8]">
                <label className="text-[11px] font-semibold text-[#1a3a2a] uppercase tracking-[0.5px] block mb-1.5">
                  Resource File {!editingItem && <span className="text-[#e57368]">*</span>}
                </label>
                <div className="flex items-center justify-center border-2 border-dashed border-[#e8eae8] rounded-lg p-4 bg-white hover:bg-[#f8faf8] transition-colors relative cursor-pointer group">
                  <input
                    type="file"
                    accept="audio/*,application/pdf"
                    onChange={(e) => setMediaFile(e.target.files[0])}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="text-center">
                    <Upload size={18} className="mx-auto text-[#5a6b5e] group-hover:text-[#1a3a2a] mb-1.5 transition-colors" />
                    <span className="text-[11px] text-[#5a6b5e] font-medium block">
                      {mediaFile ? mediaFile.name : "Choose File"}
                    </span>
                  </div>
                </div>
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

      {/* --- BOTTOM AUDIO PREVIEW PLAYER --- */}
      {previewItem && (
        <div className="fixed bottom-0 left-[240px] right-0 bg-[#1a3a2a] text-white border-t border-[#c9a84c]/20 px-6 py-4 flex items-center justify-between z-40 shadow-2xl animate-slide-up">
          <audio
            ref={audioRef}
            src={previewItem.file_url}
            onTimeUpdate={handleAudioTimeUpdate}
            onLoadedMetadata={handleAudioLoadedMetadata}
            onEnded={handleAudioEnded}
          />

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

          <div className="flex items-center gap-4">
            <button
              onClick={toggleMute}
              className="text-white/60 hover:text-white bg-transparent border-none cursor-pointer p-1 transition-colors"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <div className="w-px h-5 bg-white/10" />
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
