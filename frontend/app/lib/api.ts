// Shared API types
export interface Class {
  id: string
  name: string
  description: string
  createdAt: string
}

export interface Lesson {
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

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export const formatDate = (iso: string): string => {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}
