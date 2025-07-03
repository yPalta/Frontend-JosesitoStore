"use client"
import { useRef, useState } from "react"

export default function ExcelImport() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState("")

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append("file", file)
    const res = await fetch("http://localhost:3000/producto/excel", {
      method: "POST",
      body: formData,
    })
    const text = await res.text()
    setMessage(text)
  }

  return (
    <div className="flex flex-col items-center">
      <input
        type="file"
        accept=".xlsx,.xls"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow transition mb-2"
      >
        Importar productos desde Excel
      </button>
      {message && <div className="text-green-600 text-sm">{message}</div>}
    </div>
  )
}