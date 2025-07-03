"use client"
import TopSellingProducts from "@/components/admin/top-selling-products"
import TopCategories from "@/components/admin/top-categories"
import TopRatedProducts from "@/components/admin/top-rated-products"
import ProductSales from "@/components/admin/product-sales"
import ExcelImport from "@/components/admin/excel-import"
import ExcelExport from "@/components/admin/excel-export"
import { useApp, AppProvider } from "@/context/app-context"
import { useRouter } from "next/navigation"

function AdminDashboardContent() {
  const { dispatch } = useApp()
  const router = useRouter()

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" })
    router.replace("/")
  }

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-slate-100 to-slate-300">
      <div className="flex justify-end mb-4">
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg shadow transition"
        >
          Cerrar sesión
        </button>
      </div>
      <h1 className="text-3xl font-extrabold mb-8 text-center text-slate-800 drop-shadow">
        Panel de Administración
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition">
          <TopSellingProducts />
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition">
          <TopCategories />
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition">
          <TopRatedProducts />
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition">
          <ProductSales />
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
        <ExcelImport />
        <ExcelExport />
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <AppProvider>
      <AdminDashboardContent />
    </AppProvider>
  )
}