"use client"
import { useEffect, useState } from "react"
import { useAdminDashboard } from "@/hooks/useAdminDashboard"

export default function TopSellingProducts() {
  const { getTopSellingProducts } = useAdminDashboard()
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    getTopSellingProducts().then(setProducts)
  }, [getTopSellingProducts])

  return (
    <div className="border rounded p-4">
      <h2 className="font-bold mb-2">Top Productos Más Vendidos</h2>
      <ul>
        {products.map((p, i) => (
          <li key={p._id || p.id || i}>
            {i + 1}. {p.nombre || p.name} - {p.cantidadVentas || 0} ventas
          </li>
        ))}
      </ul>
    </div>
  )
}