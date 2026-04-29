"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"

type Lesson = {
  id: string
  title: string
  description: string
  type: string
}

export default function CoursesPage() {
  const [data, setData] = useState<Lesson[]>([])
  const router = useRouter()

  useEffect(() => {
    axios.get("http://localhost:3000/lessons")
      .then(res => setData(res.data))
      .catch(err => console.error(err))
  }, [])

  return (
    <div className="p-10 bg-gray-50 min-h-screen grid gap-6 grid-cols-1 md:grid-cols-3">
      {data.length === 0 ? (
        <p>Chưa có bài giảng</p>
      ) : (
        data.map((item) => (
          <div
            key={item.id}
            onClick={() => router.push(`/courses/${item.id}`)}
            className="bg-white p-6 rounded-2xl shadow-md hover:scale-105 transition cursor-pointer"
          >
            <h2 className="font-semibold text-lg">{item.title}</h2>
            <p className="text-sm text-gray-500">{item.description}</p>
            <span className="text-xs mt-2 inline-block">{item.type}</span>
          </div>
        ))
      )}
    </div>
  )
}