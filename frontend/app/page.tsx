"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import axios from "axios"
import { Lesson, API_BASE } from "./lib/api"

export default function LandingPage() {
  const router = useRouter()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

  const stats = [
    { icon: "🏫", value: Array.isArray(classes) ? classes.length : 0, label: "Lớp học" },
    { icon: "🎓", value: Array.isArray(lessons) ? lessons.filter(l => l.type === "video").length : 0, label: "Video" },
    { icon: "📚", value: Array.isArray(lessons) ? lessons.filter(l => l.type === "pdf").length : 0, label: "PDF" },
  ]

  return (
    <div className="page">
      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="navbar-inner">
          <a href="/" className="logo">
            <Image src="/Logo.jpg" alt="English Winner Logo" width={32} height={32} style={{ width: "32px", height: "32px", borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
            <span className="logo-text">English Winner</span>
          </a>
          <ul className="nav-links">
            <li><a href="#hero" className="nav-link">Giới thiệu</a></li>
            <li><a href="#features" className="nav-link">Tính năng</a></li>
            <li><a href="#classes" className="nav-link">Lớp học</a></li>
            <li><a href="/lessons" className="nav-link">Bài giảng</a></li>
          </ul>
          <button className="btn btn-primary btn-sm" onClick={() => router.push("/admin")}>
            ✦ Quản trị
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        id="hero"
        style={{
          position: "relative",
          background: "linear-gradient(160deg, var(--bg) 0%, #fff0c7 100%)",
          padding: "clamp(80px, 15vw, 120px) 0 clamp(60px, 10vw, 100px)",
        }}
      >
        {/* Blobs */}
        <div
          className="hero-blob"
          style={{ width: 500, height: 500, background: "rgba(254,186,2,0.15)", top: -120, right: -100 }}
        />
        <div
          className="hero-blob"
          style={{ width: 350, height: 350, background: "rgba(0,77,61,0.1)", bottom: -80, left: -60 }}
        />

        <div className="container" style={{ position: "relative", textAlign: "center" }}>
          <h1
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4.25rem)",
              fontWeight: 900,
              lineHeight: 1.3,
              display: "block",
              padding: "0 10px 8px",
              backgroundImage: "linear-gradient(135deg, var(--secondary) 0%, #006d56 40%, var(--primary) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: 16,
            }}
          >
            Học tiếng Anh <br />Tự tin, Thành công
          </h1>

          <p
            style={{
              fontSize: "clamp(1rem, 2.8vw, 1.125rem)",
              color: "var(--text-secondary)",
              maxWidth: 800,
              margin: "0 auto 40px",
              lineHeight: 1.6,
              padding: "0 24px",
              textAlign: "center"
            }}
          >
            English Winner — nhiều năm kinh nghiệm đào tạo tiếng Anh. Khám phá bài giảng video và tài liệu PDF chất lượng cao, học mọi lúc mọi nơi.
          </p>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn btn-primary btn-lg" onClick={() => router.push("/lessons")}>
              🚀 Học ngay hôm nay
            </button>
          </div>

          {/* Stats row */}
          <div
            style={{
              display: "flex",
              gap: 32,
              justifyContent: "center",
              marginTop: 64,
              flexWrap: "wrap",
            }}
          >
            {stats.map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "2rem", fontWeight: 900, color: "var(--text-primary)" }}>
                  {loading ? "—" : s.value}
                </div>
                <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: 4 }}>
                  {s.icon} {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* ── Features ── */}
      <section id="features" className="section">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>Tại sao chọn EnglishWinner ? </h2>
            <p className="section-desc" style={{ margin: "0 auto" }}>
              Nền tảng được xây dựng dành riêng cho việc chia sẻ tri thức một cách hiệu quả và chuyên nghiệp.
            </p>
          </div>

          <div className="grid-3">
            {[
              {
                icon: "🎓",
                title: "Video bài giảng",
                desc: "Hệ thống video sắc nét, bài giảng sinh động giúp bạn tiếp thu kiến thức nhanh chóng.",
              },
              {
                icon: "📚",
                title: "Tài liệu PDF",
                desc: "Hệ thống tài liệu đi kèm chi tiết, có thể xem trực tiếp không cần tải về.",
              },
              {
                icon: "🏫",
                title: "Phân loại theo lớp",
                desc: "Bài giảng được sắp xếp khoa học theo từng lớp học, dễ dàng theo dõi lộ trình.",
              },
            ].map((f) => (
              <div className="card" key={f.title}>
                <div className="card-body">
                  <div
                    style={{
                      fontSize: "1.75rem",
                      marginBottom: 16,
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: "linear-gradient(135deg, rgba(254,186,2,0.15), rgba(0,77,61,0.1))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {f.icon}
                  </div>
                  <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ fontSize: "0.9rem", lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Promo Banner (Featured News) ── */}
      <section id="promo" style={{ padding: "20px 0 100px 0", background: "var(--bg)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <p className="section-label">Tin nổi bật</p>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: 8 }}>Chương trình tuyển sinh 2026</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>Cơ hội nhận học bổng và lộ trình học tập tối ưu cùng English Winner.</p>
          </div>
          <div
            style={{
              borderRadius: "var(--radius-xl)",
              overflow: "hidden",
              boxShadow: "var(--shadow-lg)",
              border: "1px solid var(--border-subtle)"
            }}
          >
            <Image
              src="/Signature.jpg"
              alt="Promotional Banner"
              width={1200}
              height={400}
              sizes="(max-width: 1200px) 100vw, 1200px"
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </div>
        </div>
      </section>

      {/* ── Browse by Classes ── */}
      <section id="classes" className="section" style={{ background: "var(--surface-2)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <p className="section-label">Danh mục</p>
            <h2 className="section-title">Khám phá theo lớp học</h2>
            <p className="section-desc" style={{ margin: "0 auto" }}>
              Chọn lớp học phù hợp với trình độ và mục tiêu của bạn để bắt đầu.
            </p>
          </div>

          {loading ? (
            <div className="grid-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton" style={{ height: 200, borderRadius: "var(--radius-xl)" }} />
              ))}
            </div>
          ) : classes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
              Chưa có lớp học nào được tạo.
            </div>
          ) : (
            <div className="grid-3">
              {classes.map(c => {
                const classLessons = lessons.filter(l => l.classId === c.id)
                return (
                  <div
                    key={c.id}
                    className="card class-card"
                    onClick={() => router.push(`/lessons?classId=${c.id}`)}
                    style={{
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      border: "1px solid var(--border-subtle)",
                      display: "flex",
                      flexDirection: "column"
                    }}
                  >
                    <div className="card-body" style={{ flex: 1 }}>
                      <div style={{
                        width: 50,
                        height: 50,
                        borderRadius: 12,
                        background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.5rem",
                        color: "white",
                        marginBottom: 20
                      }}>
                        🏫
                      </div>
                      <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: 12, color: "var(--text-primary)" }}>{c.name}</h3>
                      <p style={{ fontSize: "0.9375rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 20 }}>
                        {c.description || "Khám phá các bài giảng chất lượng trong lớp học này."}
                      </p>
                    </div>
                    <div style={{
                      padding: "16px 24px",
                      borderTop: "1px solid var(--border-subtle)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: "rgba(0,0,0,0.02)"
                    }}>
                      <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--primary)" }}>
                        {classLessons.length} bài giảng
                      </span>
                      <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>Xem chi tiết →</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Recent Lessons preview ── */}
      {Array.isArray(lessons) && lessons.length > 0 && (
        <section id="recent" className="section" style={{ background: "var(--surface-2)", borderTop: "1px solid var(--border-subtle)" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <p className="section-label">Mới nhất</p>
              <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: 12 }}>Bài giảng gần đây</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => router.push("/lessons")} style={{ borderRadius: "var(--radius-full)" }}>
                Xem tất cả →
              </button>
            </div>

            <div className="grid-3">
              {lessons.slice(0, 3).map((lesson) => (
                <div
                  key={lesson.id}
                  className="lesson-card"
                  onClick={() => router.push(`/lessons/${lesson.id}`)}
                  id={`lesson-card-${lesson.id}`}
                >
                  <div className={`lesson-card-thumb ${lesson.type === "video" ? "video-thumb" : "pdf-thumb"}`}>
                    <span style={{ fontSize: "3rem", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))" }}>
                      {lesson.type === "video" ? "🎬" : "📄"}
                    </span>
                  </div>
                  <div className="lesson-card-content">
                    <h3 className="lesson-card-title">{lesson.title}</h3>
                    <p className="lesson-card-desc">
                      {lesson.description || "Không có mô tả"}
                    </p>
                  </div>
                  <div className="lesson-card-footer">
                    <span className={`badge ${lesson.type === "video" ? "badge-video" : "badge-pdf"}`}>
                      {lesson.type === "video" ? "▶ Video" : "📄 PDF"}
                    </span>
                    <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                      Xem ngay →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}


      {/* ── Footer ── */}
      <footer className="footer">
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 40 }}>
            <div>
              <div className="logo" style={{ marginBottom: 16 }}>
                <Image src="/Logo.jpg" alt="English Winner Logo" width={48} height={48} style={{ width: "48px", height: "48px", borderRadius: 12, objectFit: "cover", flexShrink: 0 }} />
                <span style={{ fontSize: "1.25rem", fontWeight: 800 }}>English Winner</span>
              </div>
              <p style={{ fontSize: "0.875rem", maxWidth: 300, lineHeight: 1.6 }}>
                Hệ thống quản lý bài giảng trực tuyến dành riêng cho học viên English Winner.
              </p>
            </div>

            <div style={{ display: "flex", gap: 60 }}>
              <div>
                <p style={{ fontWeight: 700, marginBottom: 16, fontSize: "0.9375rem", color: "white" }}>Liên kết</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { label: "Trang chủ", href: "/" },
                    { label: "Bài giảng", href: "/lessons" },
                    { label: "Quản trị", href: "/admin" },
                  ].map(l => (
                    <a key={l.label} href={l.href} style={{ fontSize: "0.875rem" }}>{l.label}</a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ margin: "40px 0 24px", height: 1, background: "rgba(255,255,255,0.1)" }} />
          <p style={{ textAlign: "center", fontSize: "0.8125rem" }}>
            © {new Date().getFullYear()} English Winner. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
