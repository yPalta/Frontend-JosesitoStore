"use client"
import { useEffect, useState } from "react"
import { useAdminDashboard } from "@/hooks/useAdminDashboard"

export default function ProductSales() {
  const { getProductSales } = useAdminDashboard()
  const [sales, setSales] = useState<any[]>([])

  useEffect(() => {
    getProductSales().then(setSales)
  }, [getProductSales])

  return (
    <div className="border rounded p-4">
      <h2 className="font-bold mb-2">Ventas por Producto</h2>
      <ul>
        {sales.map((s, i) => (
          <li key={s.nombre || i}>
            {s.nombre} - {s.ventas} ventas
          </li>
        ))}
    </ul>
    </div>
  )
}