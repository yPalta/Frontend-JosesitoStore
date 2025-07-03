import { useCallback } from "react"

const API = "http://localhost:3000/admin"

export function useAdminDashboard() {
  const getTopSellingProducts = useCallback(async () => {
    const res = await fetch(`${API}/top-selling-products`)
    return res.json()
  }, [])

  const getTopCategories = useCallback(async () => {
    const res = await fetch(`${API}/top-categories`)
    return res.json()
  }, [])

  const getTopRatedProducts = useCallback(async () => {
    const res = await fetch(`${API}/top-rated-products`)
    return res.json()
  }, [])

  const getProductSales = useCallback(async () => {
    const res = await fetch(`${API}/product-sales`)
    return res.json()
  }, [])

  return {
    getTopSellingProducts,
    getTopCategories,
    getTopRatedProducts,
    getProductSales,
  }
}