"use client"
import { useEffect, useState } from "react"
import { useAdminDashboard } from "@/hooks/useAdminDashboard"

export default function TopRatedProducts() {
  const { getTopRatedProducts } = useAdminDashboard()
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    getTopRatedProducts().then(setProducts)
  }, [getTopRatedProducts])

  return (
    <div className="border rounded p-4">
      <h2 className="font-bold mb-2">Top Productos Mejor Valorados</h2>
      <ul>
        {products.map((p, i) => (
          <li key={p._id || p.id || i}>
            {i + 1}. {p.nombre || p.name} - {p.promedioValoracion?.toFixed(2) || 0} ⭐ ({p.cantidadValoraciones || 0} valoraciones)
          </li>
        ))}
      </ul>
    </div>
  )
}