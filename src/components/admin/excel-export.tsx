"use client"
export default function ExcelExport() {
  const handleExport = async () => {
    const res = await fetch("http://localhost:3000/producto/excel/exportar")
    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "productos.xlsx"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow transition"
    >
      Exportar productos a Excel
    </button>
  )
}