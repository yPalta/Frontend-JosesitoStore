"use client"

import { useState, useEffect } from "react"
import { Header } from "../components/header"
import { GameCard } from "../components/game-card"
import { GameModal } from "../components/game-modal"
import { LoginModal } from "../components/login-modal"
import { PurchaseHistoryModal } from "../components/purchase-history-modal"
import { AppProvider } from "../context/app-context"
import type { Game } from "../types/game"
import { CartSidebar } from "../components/cart-sidebar"
import { RegisterModal } from "../components/register-modal"
import { useApp } from "../context/app-context"
import React from "react"
import { useRouter } from "next/navigation"

function mapProductoToGame(producto: any): Game {
  return {
    id: producto._id,
    name: producto.nombre,
    image: producto.imageUrl || "/placeholder.svg",
    price: producto.precio,
    originalPrice: undefined,
    discount: undefined,
    rating: producto.promedioValoracion || 0,
    reviewCount: producto.cantidadValoraciones || 0,
    categories: producto.categorias || [],
    stock: producto.stock,
    comments: [],
    platform: [],
    description: "",
  }
}

function GameStoreContent() {
  const { state, dispatch } = useApp()
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [isGameModalOpen, setIsGameModalOpen] = useState(false)
  const [games, setGames] = useState<Game[]>([])
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"valoracion" | "precio" | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (state.user?.rol === "admin") {
      router.replace("/admin")
    }
  }, [state.user, router])

  const fetchGames = () => {
    fetch("http://localhost:3000/producto")
      .then((res) => res.json())
      .then((data) => {
        const mappedGames = data.map(mapProductoToGame)
        setGames(mappedGames)
        dispatch({ type: "UPDATE_GAMES", payload: mappedGames })
      })
      .catch(() => setGames([]))
  }

  useEffect(() => {
    fetchGames()
  }, [dispatch])

  const handleGameClick = (game: Game) => {
    setSelectedGame(game)
    setIsGameModalOpen(true)
  }

  const handleCloseGameModal = () => {
    setIsGameModalOpen(false)
    setSelectedGame(null)
    fetchGames()
  }

  // Obtener categorías únicas
  const categories = Array.from(new Set(games.flatMap(g => g.categories))).filter(Boolean)

  // Filtrar y ordenar juegos
  const filteredGames = games
    .filter(game =>
      game.name.toLowerCase().includes(search.toLowerCase()) &&
      (!selectedCategory || game.categories.includes(selectedCategory))
    )
    .sort((a, b) => {
      if (sortBy === "valoracion") return b.rating - a.rating
      if (sortBy === "precio") return a.price - b.price
      return 0
    })

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl py-8 px-4 md:px-8 xl:px-16">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Juegos Destacados</h1>
          <p className="text-muted-foreground">Descubre los mejores juegos al mejor precio</p>
        </div>

        {/* Filtros y orden */}
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border px-3 py-2 rounded"
          />
          <select
            value={selectedCategory ?? ""}
            onChange={e => setSelectedCategory(e.target.value || null)}
            className="border px-3 py-2 rounded"
          >
            <option value="">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={sortBy ?? ""}
            onChange={e => setSortBy(e.target.value as "valoracion" | "precio" | null)}
            className="border px-3 py-2 rounded"
          >
            <option value="">Ordenar por...</option>
            <option value="valoracion">Valoración</option>
            <option value="precio">Precio</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredGames.map((game) => (
            <GameCard key={game.id} game={game} onGameClick={handleGameClick} />
          ))}
        </div>
      </main>
      <GameModal game={selectedGame} isOpen={isGameModalOpen} onClose={handleCloseGameModal} />
      <LoginModal />
      <RegisterModal />
      <PurchaseHistoryModal />
      <CartSidebar games={games} fetchGames={fetchGames} />
    </div>
  )
}

export default function Page() {
  return (
    <AppProvider>
      <GameStoreContent />
    </AppProvider>
  )
}