"use client"

import { Suspense, useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import axios from "axios"
import { Lesson, API_BASE, formatFileSize, formatDate } from "../lib/api"

function LessonsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialClassId = searchParams.get("classId") || "all"

  const [lessons, setLessons] = useState<Lesson[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "video" | "pdf">("all")
  const [search, setSearch] = useState("")
  const [selectedClassId, setSelectedClassId] = useState(initialClassId)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [lessonsRes, classesRes] = await Promise.all([
          axios.get<Lesson[]>(`${API_BASE}/lessons`),
          axios.get<any[]>(`${API_BASE}/classes`)
        ])
        setLessons(lessonsRes.data)
        setClasses(classesRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filtered = Array.isArray(lessons) ? lessons.filter(l => {
    const matchType = filter === "all" || l.type === filter
    const matchClass = selectedClassId === "all" || l.classId === selectedClassId
    const matchSearch = l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.description.toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch && matchClass
  }) : []

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

      {/* ── Page header ── */}
      <div
        style={{
          background: "linear-gradient(160deg, var(--bg) 0%, #fff0c7 100%)",
          borderBottom: "1px solid var(--border-subtle)",
          padding: "52px 0 40px",
        }}
      >
        <div className="container">
          <p className="section-label">Thư viện học liệu</p>
          <h1 style={{ fontSize: "2.25rem", fontWeight: 900, marginBottom: 12 }}>
            Bài giảng trực tuyến
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.0625rem" }}>
            Tìm kiếm và học từ các bài giảng chất lượng cao.
          </p>
        </div>
      </div>

      {/* ── Filter + Search bar ── */}
      <div style={{ borderBottom: "1px solid var(--border-subtle)", background: "var(--surface)", padding: "16px 0" }}>
        <div
          className="container"
          style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}
        >
          {/* Search */}
          <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
                pointerEvents: "none",
              }}
            >
              🔍
            </span>
            <input
              id="lesson-search"
              className="form-input"
              style={{ paddingLeft: 40 }}
              type="text"
              placeholder="Tìm kiếm bài giảng..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Filter tabs */}
          <div style={{ display: "flex", gap: 4 }}>
            {(["all", "video", "pdf"] as const).map(f => (
              <button
                key={f}
                className="btn btn-sm"
                id={`filter-${f}`}
                style={{
                  background: filter === f ? "var(--primary)" : "transparent",
                  color: filter === f ? "white" : "var(--text-secondary)",
                  border: filter === f ? "none" : "1px solid var(--border)",
                  borderRadius: "var(--radius-full)",
                }}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "🌍 Tất cả" : f === "video" ? "🎓 Video" : "📚 PDF"}
              </button>
            ))}
          </div>

          {/* Class Filter */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
            <button
              className={`btn btn-sm ${selectedClassId === "all" ? "btn-primary" : "btn-secondary"}`}
              style={{ borderRadius: "var(--radius-full)", whiteSpace: "nowrap" }}
              onClick={() => setSelectedClassId("all")}
            >
              🏫 Tất cả lớp
            </button>
            {classes.map(c => (
              <button
                key={c.id}
                className={`btn btn-sm ${selectedClassId === c.id ? "btn-primary" : "btn-secondary"}`}
                style={{ borderRadius: "var(--radius-full)", whiteSpace: "nowrap" }}
                onClick={() => setSelectedClassId(c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Count */}
          <span style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginLeft: "auto" }}>
            {filtered.length} bài giảng
          </span>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        {loading ? (
          <div className="grid-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} style={{ borderRadius: "var(--radius-xl)", overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
                <div className="skeleton" style={{ height: 160 }} />
                <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div className="skeleton" style={{ height: 20, width: "70%" }} />
                  <div className="skeleton" style={{ height: 14, width: "90%" }} />
                  <div className="skeleton" style={{ height: 14, width: "60%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">{search ? "🔍" : "📪"}</span>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>
              {search ? "Không tìm thấy bài giảng" : "Chưa có bài giảng nào"}
            </h2>
            <p style={{ fontSize: "0.9375rem" }}>
              {search
                ? `Không có kết quả cho "${search}". Thử tìm kiếm khác.`
                : "Hệ thống đang được cập nhật nội dung. Vui lòng quay lại sau."}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 60 }}>
            {selectedClassId === "all" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 40, alignItems: "center" }}>
                <div style={{ textAlign: "center" }}>
                  <h2 style={{ fontSize: "2rem", fontWeight: 900, color: "var(--text-primary)", marginBottom: 12 }}>
                    Vui lòng chọn lớp học của bạn
                  </h2>
                  <p style={{ color: "var(--text-secondary)", fontSize: "1.125rem", maxWidth: 500, margin: "0 auto" }}>
                    Chọn một lớp để bắt đầu khám phá các bài giảng video và tài liệu PDF tương ứng.
                  </p>
                </div>
                <div className="grid-3" style={{ width: "100%" }}>
                  {classes.map(c => (
                    <div 
                      key={c.id} 
                      className="card class-card" 
                      onClick={() => setSelectedClassId(c.id)}
                      style={{ 
                        cursor: "pointer", 
                        border: "1px solid var(--border-subtle)",
                        padding: "40px 32px",
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 20
                      }}
                    >
                      <div style={{ 
                        width: 72, 
                        height: 72, 
                        borderRadius: "50%", 
                        background: "var(--primary-light)", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        fontSize: "2.5rem",
                        color: "var(--primary-dark)"
                      }}>
                        🏫
                      </div>
                      <div>
                        <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: 8 }}>{c.name}</h3>
                        <span className="badge badge-video" style={{ background: "rgba(0,0,0,0.05)", color: "var(--text-muted)" }}>
                          {lessons.filter(l => l.classId === c.id).length} bài giảng
                        </span>
                      </div>
                      <button className="btn btn-primary btn-sm" style={{ width: "100%", marginTop: 12 }}>Vào học ngay →</button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              classes.filter(c => selectedClassId === c.id).map(c => {
                const classLessons = filtered.filter(l => l.classId === c.id)
                return (
                  <div key={c.id}>
                    <div style={{ marginBottom: 24, borderBottom: "2px solid var(--primary-light)", paddingBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--text-primary)" }}>{c.name}</h2>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: 4 }}>({classLessons.length} bài giảng)</span>
                      </div>
                      <button className="btn btn-secondary btn-sm" onClick={() => setSelectedClassId("all")}>← Đổi lớp học</button>
                    </div>
                    {classLessons.length === 0 ? (
                       <div className="empty-state">
                         <p>Lớp học này chưa có bài giảng nào.</p>
                       </div>
                    ) : (
                      <div className="grid-3">
                        {classLessons.map((lesson) => (
                          <div key={lesson.id} className="lesson-card" onClick={() => router.push(`/lessons/${lesson.id}`)}>
                            <div className={`lesson-card-thumb ${lesson.type === "video" ? "video-thumb" : "pdf-thumb"}`}>
                              <span>{lesson.type === "video" ? "🎓" : "📚"}</span>
                            </div>
                            <div className="lesson-card-content">
                              <h2 className="lesson-card-title">{lesson.title}</h2>
                              <p className="lesson-card-desc">{lesson.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function LessonsPage() {
  return (
    <Suspense fallback={
      <div className="page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div className="spinner spinner-dark"></div>
      </div>
    }>
      <LessonsContent />
    </Suspense>
  )
}
