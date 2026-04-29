import "dotenv/config"
import express, { Request, Response } from "express"
import multer from "multer"
import cors from "cors"
import fs from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

const app = express()

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}))
app.use(express.json())

const UPLOAD_DIR = path.join(process.cwd(), "uploads")
const DATA_FILE = path.join(process.cwd(), "lessons.json")

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]", "utf-8")

// Serve uploaded files as static
app.use("/uploads", express.static(UPLOAD_DIR))

// ── Multer config ──────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    // Multer (busboy) defaults to latin1, decode to utf8 for Vietnamese chars
    const originalNameUtf8 = Buffer.from(file.originalname, "latin1").toString("utf-8")
    const sanitized = originalNameUtf8.replace(/\s+/g, "_")
    cb(null, `${Date.now()}-${sanitized}`)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "video/mp4", "video/webm", "video/ogg", "video/mpeg",
      "application/pdf"
    ]
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`))
    }
  }
})

// ── Types ──────────────────────────────────────────────────────────────────────
interface Class {
  id: string
  name: string
  description: string
  createdAt: string
}

interface Lesson {
  id: string
  classId: string
  title: string
  description: string
  fileUrl: string
  type: "video" | "pdf"
  fileName: string
  fileSize: number
  createdAt: string
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const CLASS_FILE = path.join(process.cwd(), "classes.json")
if (!fs.existsSync(CLASS_FILE)) fs.writeFileSync(CLASS_FILE, "[]", "utf-8")

const readClasses = (): Class[] => {
  try {
    return JSON.parse(fs.readFileSync(CLASS_FILE, "utf-8"))
  } catch {
    return []
  }
}

const writeClasses = (data: Class[]): void => {
  fs.writeFileSync(CLASS_FILE, JSON.stringify(data, null, 2), "utf-8")
}

const readLessons = (): Lesson[] => {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"))
  } catch {
    return []
  }
}

const writeLessons = (data: Lesson[]): void => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8")
}

// ── Routes ─────────────────────────────────────────────────────────────────────

/**
 * GET /classes
 * Return all classes
 */
app.get("/classes", (_req: Request, res: Response): void => {
  try {
    const classes = readClasses()
    res.json(classes)
  } catch (err) {
    console.error("[GET /classes]", err)
    res.status(500).json({ message: "Failed to fetch classes" })
  }
})

/**
 * POST /classes
 * Create a new class
 */
app.post("/classes", (req: Request, res: Response): void => {
  try {
    const { name, description } = req.body
    if (!name || !name.trim()) {
      res.status(400).json({ message: "Class name is required" })
      return
    }

    const newClass: Class = {
      id: uuidv4(),
      name: name.trim(),
      description: description?.trim() ?? "",
      createdAt: new Date().toISOString()
    }

    const classes = readClasses()
    classes.unshift(newClass)
    writeClasses(classes)

    res.status(201).json(newClass)
  } catch (err) {
    console.error("[POST /classes]", err)
    res.status(500).json({ message: "Failed to create class" })
  }
})

/**
 * DELETE /classes/:id
 * Delete a class (and its lessons?)
 */
app.delete("/classes/:id", (req: Request, res: Response): void => {
  try {
    const classes = readClasses()
    const index = classes.findIndex(c => c.id === req.params.id)
    if (index === -1) {
      res.status(404).json({ message: "Class not found" })
      return
    }

    // Optional: Delete lessons associated with this class
    const lessons = readLessons()
    const filteredLessons = lessons.filter(l => l.classId !== req.params.id)
    
    // Delete files for removed lessons
    const removedLessons = lessons.filter(l => l.classId === req.params.id)
    removedLessons.forEach(l => {
      const filename = path.basename(l.fileUrl)
      const filePath = path.join(UPLOAD_DIR, filename)
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    })

    classes.splice(index, 1)
    writeClasses(classes)
    writeLessons(filteredLessons)

    res.json({ message: "Class and its lessons deleted" })
  } catch (err) {
    console.error("[DELETE /classes/:id]", err)
    res.status(500).json({ message: "Failed to delete class" })
  }
})

/**
 * POST /upload
 * Upload a new lesson (file + metadata)
 */
app.post("/upload", upload.single("file"), (req: Request, res: Response): void => {
  try {
    const { title, description, classId } = req.body
    const file = req.file

    if (!file) {
      res.status(400).json({ message: "No file uploaded" })
      return
    }

    if (!title || !title.trim()) {
      res.status(400).json({ message: "Title is required" })
      return
    }

    if (!classId) {
      res.status(400).json({ message: "Class ID is required" })
      return
    }

    const type: "video" | "pdf" = file.mimetype.includes("pdf") ? "pdf" : "video"
    const originalNameUtf8 = Buffer.from(file.originalname, "latin1").toString("utf-8")

    const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`
    const newLesson: Lesson = {
      id: uuidv4(),
      classId,
      title: title.trim(),
      description: description?.trim() ?? "",
      fileUrl: `${baseUrl}/uploads/${file.filename}`,
      type,
      fileName: originalNameUtf8,
      fileSize: file.size,
      createdAt: new Date().toISOString()
    }

    const lessons = readLessons()
    lessons.unshift(newLesson) // newest first
    writeLessons(lessons)

    res.status(201).json(newLesson)
  } catch (err) {
    console.error("[POST /upload]", err)
    res.status(500).json({ message: "Upload failed. Please try again." })
  }
})

/**
 * GET /lessons
 * Return all lessons or filtered by classId
 */
app.get("/lessons", (req: Request, res: Response): void => {
  try {
    const { classId } = req.query
    let lessons = readLessons()
    if (classId) {
      lessons = lessons.filter(l => l.classId === classId)
    }
    res.json(lessons)
  } catch (err) {
    console.error("[GET /lessons]", err)
    res.status(500).json({ message: "Failed to fetch lessons" })
  }
})

/**
 * GET /lessons/:id
 * Return single lesson by id
 */
app.get("/lessons/:id", (req: Request, res: Response): void => {
  try {
    const lessons = readLessons()
    const lesson = lessons.find((l) => l.id === req.params.id)

    if (!lesson) {
      res.status(404).json({ message: "Lesson not found" })
      return
    }

    res.json(lesson)
  } catch (err) {
    console.error("[GET /lessons/:id]", err)
    res.status(500).json({ message: "Failed to fetch lesson" })
  }
})

/**
 * DELETE /lessons/:id
 * Delete a lesson and its file from disk
 */
app.delete("/lessons/:id", (req: Request, res: Response): void => {
  try {
    const lessons = readLessons()
    const index = lessons.findIndex((l) => l.id === req.params.id)

    if (index === -1) {
      res.status(404).json({ message: "Lesson not found" })
      return
    }

    const [removed] = lessons.splice(index, 1)

    // Delete physical file
    const filename = path.basename(removed.fileUrl)
    const filePath = path.join(UPLOAD_DIR, filename)
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)

    writeLessons(lessons)
    res.json({ message: "Lesson deleted", id: removed.id })
  } catch (err) {
    console.error("[DELETE /lessons/:id]", err)
    res.status(500).json({ message: "Failed to delete lesson" })
  }
})

// ── Start ──────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`🚀 LMS API running at http://localhost:${PORT}`)
  console.log(`   → GET    /classes`)
  console.log(`   → POST   /classes`)
  console.log(`   → DELETE /classes/:id`)
  console.log(`   → POST   /upload (with classId)`)
  console.log(`   → GET    /lessons (optional ?classId=...)`)
  console.log(`   → GET    /lessons/:id`)
  console.log(`   → DELETE /lessons/:id`)
})