"use client"
import { useEffect, useState } from "react"
import { useAdminDashboard } from "@/hooks/useAdminDashboard"

export default function TopCategories() {
  const { getTopCategories } = useAdminDashboard()
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    getTopCategories().then(setCategories)
  }, [getTopCategories])

  return (
    <div className="border rounded p-4">
      <h2 className="font-bold mb-2">Top Categorías Más Vendidas</h2>
      <ul>
        {categories.map((c, i) => (
          <li key={c.categoria || i}>
            {i + 1}. {c.categoria} - {c.ventas} ventas
          </li>
        ))}
      </ul>
    </div>
  )
}