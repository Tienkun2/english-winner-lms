"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import axios from "axios"
import { Lesson, API_BASE, formatFileSize, formatDate } from "../../lib/api"

export default function LessonDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!id) return
    const fetchData = async () => {
      setLoading(true)
      try {
        const [lessonRes, classesRes] = await Promise.all([
          axios.get<Lesson>(`${API_BASE}/lessons/${id}`),
          axios.get<any[]>(`${API_BASE}/classes`)
        ])
        setLesson(lessonRes.data)
        setClasses(classesRes.data)
      } catch (err) {
        setError("Không tìm thấy bài giảng")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  return (
    <div className="page">
      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="navbar-inner">
          <a href="/" className="logo">
            <Image src="/Logo.jpg" alt="English Winner Logo" width={32} height={32} style={{ borderRadius: 8, objectFit: "cover" }} />
            <span className="logo-text">English Winner</span>
          </a>
          <ul className="nav-links">
            <li><a href="/#hero" className="nav-link">Giới thiệu</a></li>
            <li><a href="/#features" className="nav-link">Tính năng</a></li>
            <li><a href="/#classes" className="nav-link">Lớp học</a></li>
            <li><a href="/lessons" className="nav-link active">Bài giảng</a></li>
          </ul>
          <button className="btn btn-primary btn-sm" onClick={() => router.push("/admin")}>
            ✦ Quản trị
          </button>
        </div>
      </nav>

      <div className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>
        {/* ── Breadcrumbs ── */}
        <nav style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, fontSize: "0.875rem" }}>
          <a href="/" style={{ color: "var(--text-muted)" }}>Trang chủ</a>
          <span style={{ color: "var(--text-muted)" }}>/</span>
          <a href="/lessons" style={{ color: "var(--text-muted)" }}>Bài giảng</a>
          <span style={{ color: "var(--text-muted)" }}>/</span>
          <span style={{ color: "var(--primary)", fontWeight: 700 }}>{lesson?.title || "Chi tiết"}</span>
        </nav>

        {/* ── Back Button ── */}
        <button className="back-btn" onClick={() => router.push("/lessons")}>
          <span style={{ fontSize: "1.2rem" }}>←</span> Danh sách bài giảng
        </button>

        {/* Loading skeleton */}
        {loading && (
          <div className="lesson-detail-layout" style={{ alignItems: "start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="skeleton" style={{ height: 36, width: "60%" }} />
              <div className="skeleton" style={{ height: 20, width: "40%" }} />
              <div className="skeleton" style={{ height: 400, borderRadius: "var(--radius-xl)" }} />
            </div>
            <div className="skeleton" style={{ height: 280, borderRadius: "var(--radius-xl)" }} />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="empty-state">
            <span className="empty-icon">⚠️</span>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>{error}</h2>
            <button className="btn btn-primary" onClick={() => router.push("/lessons")}>
              Về danh sách bài giảng
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && lesson && (
          <div className="lesson-detail-layout" style={{ alignItems: "start" }}>
            {/* ── Left: Player / Viewer ── */}
            <div>


              {/* Video player */}
              {lesson.type === "video" && (
                <div className="player-container">
                  <video
                    id="lesson-video-player"
                    controls
                    autoPlay={false}
                    preload="metadata"
                    style={{ width: "100%", display: "block", maxHeight: 540, background: "#000" }}
                    key={lesson.fileUrl}
                  >
                    <source src={lesson.fileUrl} />
                    Trình duyệt của bạn không hỗ trợ video.
                  </video>
                </div>
              )}

              {/* PDF viewer */}
              {lesson.type === "pdf" && (
                <div>
                  <div className="pdf-container">
                    <iframe
                      id="lesson-pdf-viewer"
                      src={`${lesson.fileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                      title={lesson.title}
                    />
                  </div>
                  <div style={{ marginTop: 12, textAlign: "center" }}>
                    <a
                      href={lesson.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                    >
                      ↗ Mở trong tab mới
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* ── Right: Sidebar ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Title Card */}
              <div style={{ background: "var(--surface)", borderRadius: "var(--radius-xl)", padding: "20px 24px", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-sm)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span className={`badge ${lesson.type === "video" ? "badge-video" : "badge-pdf"}`}>
                    {lesson.type === "video" ? "▶ Video" : "📄 PDF"}
                  </span>
                  {lesson.classId && (
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--primary)" }}>
                      🏫 {classes.find(c => c.id === lesson.classId)?.name || "Đang tải..."}
                    </span>
                  )}
                </div>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 800, lineHeight: 1.3, color: "var(--text-primary)" }}>{lesson.title}</h1>
                {lesson.description && (
                  <p style={{ marginTop: 8, fontSize: "0.9375rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    {lesson.description}
                  </p>
                )}
              </div>

              {/* Info card */}
              <div
                style={{
                  background: "var(--surface)",
                  borderRadius: "var(--radius-xl)",
                  border: "1px solid var(--border-subtle)",
                  boxShadow: "var(--shadow-sm)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "16px 20px",
                    borderBottom: "1px solid var(--border-subtle)",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    color: "var(--text-primary)",
                    background: "var(--surface-2)",
                  }}
                >
                  Thông tin bài giảng
                </div>
                <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
                  {[
                    { label: "Loại", value: lesson.type === "video" ? "🎓 Video" : "📚 PDF" },
                    { label: "Tên file", value: lesson.fileName },
                    { label: "Kích thước", value: formatFileSize(lesson.fileSize) },
                    { label: "Ngày đăng", value: formatDate(lesson.createdAt) },
                  ].map(row => (
                    <div key={row.label}>
                      <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 3 }}>
                        {row.label}
                      </div>
                      <div style={{ fontSize: "0.875rem", color: "var(--text-primary)", fontWeight: 500, wordBreak: "break-all" }}>
                        {row.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Download / Open link */}
              <a
                href={lesson.fileUrl}
                download={lesson.fileName}
                className="btn btn-secondary"
                style={{ width: "100%", justifyContent: "center" }}
              >
                ⬇ Tải xuống
              </a>

            </div>
          </div>
        )}
      </div>
    </div>
  )
}
