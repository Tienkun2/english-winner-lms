"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import axios from "axios"
import { Lesson, API_BASE, formatFileSize, formatDate } from "../lib/api"

type UploadStatus = "idle" | "uploading" | "success" | "error"

export default function AdminPage() {
  const router = useRouter()

  // ── Form state ──
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Validation States
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // ── Class state ──
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClassId, setSelectedClassId] = useState("")
  const [newClassName, setNewClassName] = useState("")
  const [newClassDesc, setNewClassDesc] = useState("")
  const [isCreatingClass, setIsCreatingClass] = useState(false)

  // ── Lessons list state ──
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // ── Toast state ──
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: "success" | "error" }[]>([])
  const [activeTab, setActiveTab] = useState<"classes" | "lessons">("classes")

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, msg, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }

  // ── Confirm Modal state ──
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmConfig, setConfirmConfig] = useState({
    title: "",
    message: "",
    onConfirm: () => {},
    isDanger: true
  })

  // ── Load data ──
  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${API_BASE}/classes`)
      setClasses(res.data)
      if (res.data.length > 0 && !selectedClassId) {
        setSelectedClassId(res.data[0].id)
      }
    } catch (err) {
      console.error("Fetch classes error", err)
    }
  }

  const fetchLessons = () => {
    setListLoading(true)
    axios.get<Lesson[]>(`${API_BASE}/lessons`)
      .then(res => setLessons(res.data))
      .catch(console.error)
      .finally(() => setListLoading(false))
  }

  useEffect(() => { 
    fetchClasses()
    fetchLessons() 
  }, [])

  const validateClassForm = () => {
    const newErrors: { [key: string]: string } = {}
    if (!newClassName.trim()) newErrors.className = "Tên lớp học không được để trống"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateLessonForm = () => {
    const newErrors: { [key: string]: string } = {}
    if (!title.trim()) newErrors.lessonTitle = "Tiêu đề không được để trống"
    if (!selectedClassId) newErrors.lessonClass = "Vui lòng chọn lớp học"
    if (!file) newErrors.lessonFile = "Vui lòng chọn file bài giảng"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ── Class handling ──
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateClassForm()) return

    setIsCreatingClass(true)
    try {
      const res = await axios.post(`${API_BASE}/classes`, {
        name: newClassName.trim(),
        description: newClassDesc.trim()
      })
      setClasses(prev => [res.data, ...prev])
      setSelectedClassId(res.data.id)
      setNewClassName("")
      setNewClassDesc("")
      setErrors({})
      showToast("Tạo lớp học thành công!")
    } catch (err) {
      showToast("Tạo lớp học thất bại", "error")
    } finally {
      setIsCreatingClass(false)
    }
  }

  const handleDeleteClass = (id: string, name: string) => {
    setConfirmConfig({
      title: "Xoá lớp học?",
      message: `Tất cả bài giảng trong lớp "${name}" cũng sẽ bị xoá vĩnh viễn. Hành động này không thể hoàn tác.`,
      onConfirm: async () => {
        try {
          await axios.delete(`${API_BASE}/classes/${id}`)
          setClasses(prev => prev.filter(c => c.id !== id))
          if (selectedClassId === id) setSelectedClassId("")
          fetchLessons()
          showToast("Xoá lớp thành công")
          setShowConfirm(false)
        } catch {
          showToast("Xoá lớp thất bại", "error")
        }
      },
      isDanger: true
    })
    setShowConfirm(true)
  }

  // ── File handling ──
  const handleFileChange = (f: File | undefined | null) => {
    if (!f) return
    const allowed = ["video/mp4", "video/webm", "video/ogg", "video/mpeg", "application/pdf"]
    if (!allowed.includes(f.type)) {
      setErrorMsg("Chỉ hỗ trợ: MP4, WebM, OGG, MPEG, PDF")
      setUploadStatus("error")
      return
    }
    setFile(f)
    setUploadStatus("idle")
    setErrorMsg("")
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    handleFileChange(droppedFile)
  }

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Trigger validation
    if (!validateLessonForm()) return

    const formData = new FormData()
    formData.append("title", title.trim())
    formData.append("description", description.trim())
    formData.append("classId", selectedClassId)
    formData.append("file", file!)

    setUploadStatus("uploading")
    setUploadProgress(0)

    try {
      await axios.post(`${API_BASE}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100))
        },
      })

      setUploadStatus("success")
      setTitle("")
      setDescription("")
      setFile(null)
      setErrors({})
      if (fileInputRef.current) fileInputRef.current.value = ""
      fetchLessons()
      showToast("Upload bài giảng thành công!")

      // Reset success after 3s
      setTimeout(() => setUploadStatus("idle"), 3000)
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message ?? "Upload thất bại"
        : "Đã xảy ra lỗi"
      setErrorMsg(msg)
      setUploadStatus("error")
    }
  }

  // ── Delete ──
  const handleDelete = (id: string, title: string) => {
    setConfirmConfig({
      title: "Xoá bài giảng?",
      message: `Bạn có chắc chắn muốn xoá bài giảng "${title}"?`,
      onConfirm: async () => {
        setDeletingId(id)
        try {
          await axios.delete(`${API_BASE}/lessons/${id}`)
          setLessons(prev => prev.filter(l => l.id !== id))
          showToast("Xoá bài giảng thành công")
          setShowConfirm(false)
        } catch {
          showToast("Xoá thất bại", "error")
        } finally {
          setDeletingId(null)
        }
      },
      isDanger: true
    })
    setShowConfirm(true)
  }

  const stats = [
    { icon: "📚", value: Array.isArray(lessons) ? lessons.length : 0, label: "Tổng bài giảng" },
    { icon: "🎬", value: Array.isArray(lessons) ? lessons.filter(l => l.type === "video").length : 0, label: "Video" },
    { icon: "📄", value: Array.isArray(lessons) ? lessons.filter(l => l.type === "pdf").length : 0, label: "PDF" },
  ]

  return (
    <div className="page">
      {/* ── Toast Snackbar ── */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-item toast-${t.type}`}>
            <div className="toast-icon">
              {t.type === "success" ? "✓" : "✕"}
            </div>
            <div style={{ flex: 1 }}>{t.msg}</div>
          </div>
        ))}
      </div>

      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="navbar-inner">
          <a href="/" className="logo">
            <Image src="/Logo.jpg" alt="English Winner Logo" width={32} height={32} style={{ borderRadius: 8, objectFit: "cover" }} />
            <span className="logo-text">Quản trị hệ thống</span>
          </a>
          <ul className="nav-links">
            <li><a href="/#hero" className="nav-link">Giới thiệu</a></li>
            <li><a href="/#features" className="nav-link">Tính năng</a></li>
            <li><a href="/#classes" className="nav-link">Lớp học</a></li>
            <li><a href="/lessons" className="nav-link">Bài giảng</a></li>
          </ul>
          <button className="btn btn-primary btn-sm hide-on-mobile" onClick={() => router.push("/admin")}>
            ✦ Quản trị
          </button>
        </div>
      </nav>

      <div className="container" style={{ 
        paddingTop: "clamp(72px, 12vw, 90px)", 
        paddingBottom: 60 
      }}>
        {/* ── Header ── */}
        <div style={{ marginBottom: 24, textAlign: "center" }}>
          <h1 style={{ 
            fontSize: "clamp(1.25rem, 6vw, 2rem)", 
            fontWeight: 900, 
            letterSpacing: "-0.02em"
          }}>
            Quản lý bài giảng
          </h1>
        </div>

        {/* ── Stat Cards ── */}
        {!listLoading && (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(2, 1fr)", 
            gap: 12, 
            marginBottom: 24 
          }}>
            <div className="stat-card" style={{ padding: "12px", minHeight: "auto" }}>
              <div className="stat-icon" style={{ 
                width: 28, height: 28, fontSize: "0.85rem", flexShrink: 0,
                background: "rgba(16,185,129,0.1)" 
              }}>🏫</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="stat-value" style={{ fontSize: "0.95rem" }}>{classes.length}</div>
                <div className="stat-label" style={{ fontSize: "0.6rem" }}>Lớp học</div>
              </div>
            </div>
            {stats.map((s) => (
              <div className="stat-card" key={s.label} style={{ padding: "12px", minHeight: "auto" }}>
                <div
                  className="stat-icon"
                  style={{
                    width: 28, height: 28, fontSize: "0.85rem", flexShrink: 0,
                    background: "rgba(254,186,2,0.1)",
                  }}
                >
                  {s.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="stat-value" style={{ fontSize: "0.95rem" }}>{s.value}</div>
                  <div className="stat-label" style={{ fontSize: "0.6rem" }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Tabs Navigation (Forced 50/50 Grid) ── */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 1fr",
          background: "#efefef", 
          padding: 3, 
          borderRadius: 12,
          marginBottom: 24,
          width: "100%",
          maxWidth: "400px",
          marginLeft: "auto",
          marginRight: "auto",
          overflow: "hidden"
        }}>
          <button 
            className={`btn ${activeTab === "classes" ? "btn-primary" : ""}`}
            style={{ 
              borderRadius: 10, 
              padding: "10px 0", 
              fontSize: "0.85rem",
              fontWeight: 700,
              background: activeTab === "classes" ? "var(--primary)" : "transparent",
              color: activeTab === "classes" ? "white" : "#666",
              boxShadow: "none",
              border: "none",
              cursor: "pointer",
              width: "100%"
            }}
            onClick={() => setActiveTab("classes")}
          >
            🏫 Lớp học
          </button>
          <button 
            className={`btn ${activeTab === "lessons" ? "btn-primary" : ""}`}
            style={{ 
              borderRadius: 10, 
              padding: "10px 0", 
              fontSize: "0.85rem",
              fontWeight: 700,
              background: activeTab === "lessons" ? "var(--primary)" : "transparent",
              color: activeTab === "lessons" ? "white" : "#666",
              boxShadow: "none",
              border: "none",
              cursor: "pointer",
              width: "100%"
            }}
            onClick={() => setActiveTab("lessons")}
          >
            📚 Bài giảng
          </button>
        </div>

        {activeTab === "classes" ? (
          /* ── Class Management Section (Full Width Stack) ── */
          <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%" }}>
            {/* Create Class Form */}
            <div className="card" style={{ padding: "16px", width: "100%" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 16 }}>🏫 Tạo lớp học mới</h3>
              <form onSubmit={handleCreateClass} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "0.8rem" }}>Tên lớp học *</label>
                  <input 
                    className={`form-input ${errors.className ? "error" : ""}`}
                    placeholder="VD: Lớp Tiếng Anh Giao Tiếp" 
                    value={newClassName}
                    onChange={e => {
                      setNewClassName(e.target.value)
                      if (errors.className) setErrors(prev => ({ ...prev, className: "" }))
                    }}
                  />
                  {errors.className && <div className="error-message">⚠️ {errors.className}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "0.8rem" }}>Mô tả</label>
                  <textarea 
                    className="form-textarea" 
                    placeholder="Mô tả ngắn gọn..." 
                    value={newClassDesc}
                    onChange={e => setNewClassDesc(e.target.value)}
                    rows={2}
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-lg" disabled={isCreatingClass} style={{ width: "100%", height: 48 }}>
                  {isCreatingClass ? "Đang tạo..." : "+ Tạo lớp học"}
                </button>
              </form>
            </div>

            {/* Class List */}
            <div className="card" style={{ padding: "clamp(16px, 4vw, 24px)" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 16 }}>📂 Danh sách lớp học</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {classes.length === 0 ? (
                  <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px 0", fontSize: "0.9rem" }}>Chưa có lớp học nào.</p>
                ) : (
                  classes.map(c => (
                    <div className="admin-row" key={c.id} style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "space-between", 
                      padding: "12px 16px", 
                      borderRadius: 14, 
                      background: "white", 
                      border: "1px solid var(--border-subtle)",
                      boxShadow: "var(--shadow-sm)"
                    }}>
                      <div style={{ minWidth: 0, flex: 1, marginRight: 12 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{lessons.filter(l => l.classId === c.id).length} bài học</div>
                      </div>
                      <button 
                        className="btn" 
                        style={{ 
                          width: 32, 
                          height: 32, 
                          padding: 0, 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center", 
                          borderRadius: 8, 
                          background: "#fff5f5", 
                          color: "#ff4d4f",
                          border: "1px solid #ffa39e",
                          fontSize: "0.8rem"
                        }} 
                        onClick={() => handleDeleteClass(c.id, c.name)}
                      >
                        🗑
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ── Lesson Management Section (Sleek Toolbar) ── */
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Horizontal/Vertical Upload Toolbar */}
            <div className="card" style={{ padding: 12, background: "#fff", border: "1px solid var(--border-subtle)" }}>
              <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label className="form-label" style={{ fontSize: "0.8rem" }}>Tiêu đề bài giảng *</label>
                  <input
                    className={`form-input ${errors.lessonTitle ? "error" : ""}`}
                    style={{ height: 42, fontSize: "0.875rem", padding: "0 14px" }}
                    placeholder="VD: Lesson 01 - Grammar"
                    value={title}
                    onChange={e => {
                      setTitle(e.target.value)
                      if (errors.lessonTitle) setErrors(prev => ({ ...prev, lessonTitle: "" }))
                    }}
                    disabled={uploadStatus === "uploading"}
                  />
                  {errors.lessonTitle && <div className="error-message">⚠️ {errors.lessonTitle}</div>}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label className="form-label" style={{ fontSize: "0.8rem" }}>Lớp học *</label>
                    <select
                      className={`form-select ${errors.lessonClass ? "error" : ""}`}
                      style={{ height: 42, fontSize: "0.875rem", padding: "0 10px" }}
                      value={selectedClassId}
                      onChange={e => {
                        setSelectedClassId(e.target.value)
                        if (errors.lessonClass) setErrors(prev => ({ ...prev, lessonClass: "" }))
                      }}
                      disabled={uploadStatus === "uploading"}
                    >
                      <option value="">-- Chọn lớp học --</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    {errors.lessonClass && <div className="error-message">⚠️ {errors.lessonClass}</div>}
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: "0.8rem" }}>File đính kèm *</label>
                    <div 
                      className={`file-zone ${file ? "has-file" : ""} ${errors.lessonFile ? "error" : ""}`}
                      onClick={() => !file && fileInputRef.current?.click()}
                      style={{ height: 42, minHeight: 42, padding: "0 12px", borderRadius: "var(--radius)", display: "flex", alignItems: "center" }}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={e => {
                          handleFileChange(e.target.files?.[0] || null)
                          if (errors.lessonFile) setErrors(prev => ({ ...prev, lessonFile: "" }))
                        }}
                        style={{ display: "none" }}
                        accept="video/*,application/pdf"
                      />
                      {file ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                          <span style={{ fontSize: "1rem" }}>{file.type.includes("video") ? "🎬" : "📄"}</span>
                          <span style={{ flex: 1, minWidth: 0, fontSize: "0.75rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>
                          <button type="button" style={{ background: "none", border: "none", padding: 4, fontSize: "0.8rem", color: "#999", cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); setFile(null) }}>✕</button>
                        </div>
                      ) : (
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Chọn bài giảng (Video/PDF)</span>
                      )}
                    </div>
                    {errors.lessonFile && <div className="error-message">⚠️ {errors.lessonFile}</div>}
                  </div>
                </div>

                <button
                  type="submit"
                  className={`btn ${uploadStatus === "success" ? "btn-success" : "btn-primary"}`}
                  disabled={uploadStatus === "uploading"}
                  style={{ height: 48, width: "100%", fontWeight: 800, fontSize: "0.9375rem", marginTop: 8 }}
                >
                  {uploadStatus === "uploading" ? "Đang tải lên..." : uploadStatus === "success" ? "Tải lên thành công ✓" : "+ Tải lên bài giảng"}
                </button>
              </form>
            </div>

            {/* Lesson List (Full Width) */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>📚 Danh sách bài giảng</h2>
                <div className="badge">{lessons.length} bài học</div>
              </div>

              {listLoading ? (
                <div className="grid-3" style={{ gap: 16 }}>
                  {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 16 }} />)}
                </div>
              ) : !Array.isArray(lessons) || lessons.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📂</div>
                  <p>Chưa có bài giảng nào được tải lên.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                  {classes.map(c => {
                    const classLessons = lessons.filter(l => l.classId === c.id)
                    if (classLessons.length === 0) return null
                    return (
                      <div key={c.id} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ width: 3, height: 14, background: "var(--primary)", borderRadius: 2 }} />
                          {c.name} ({classLessons.length})
                        </h3>
                        {classLessons.map((lesson) => (
                          <div className="admin-row" key={lesson.id} style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: 12, 
                            padding: "10px", 
                            borderRadius: 12, 
                            background: "white", 
                            border: "1px solid var(--border-subtle)",
                            boxShadow: "var(--shadow-sm)"
                          }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", background: "var(--surface-2)" }}>
                              {lesson.type === "video" ? "🎬" : "📄"}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: "0.8rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lesson.title}</div>
                              <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{lesson.type.toUpperCase()} • {new Date(lesson.createdAt).toLocaleDateString("vi-VN")}</div>
                            </div>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button className="btn btn-secondary btn-sm" style={{ padding: "4px 8px" }} onClick={() => router.push(`/lessons/${lesson.id}`)}>👁</button>
                              <button className="btn btn-danger btn-sm" style={{ padding: "4px 8px" }} onClick={() => handleDelete(lesson.id, lesson.title)}>🗑</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Confirm Modal ── */}
      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">
              {confirmConfig.isDanger ? "⚠️" : "❓"}
            </div>
            <h3 className="modal-title">{confirmConfig.title}</h3>
            <p className="modal-message">{confirmConfig.message}</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>
                Hủy bỏ
              </button>
              <button 
                className={`btn ${confirmConfig.isDanger ? "btn-danger" : "btn-primary"}`}
                onClick={confirmConfig.onConfirm}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
