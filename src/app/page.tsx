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
    comments: [], // Si tienes comentarios estructurados, mapea aquí
    platform: [], // Si tienes plataformas, mapea aquí
    description: "", // Si tienes descripción, mapea aquí
  }
}

function GameStoreContent() {
  const { state, dispatch } = useApp()
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [isGameModalOpen, setIsGameModalOpen] = useState(false)
  const [games, setGames] = useState<Game[]>([])
  const router = useRouter()

  // Redirige a /admin si el usuario es admin
  useEffect(() => {
    if (state.user?.rol === "admin") {
      router.replace("/admin")
    }
  }, [state.user, router])

  // 1. Crea una función para recargar los juegos
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

  // 2. Llama a fetchGames en el useEffect inicial
  useEffect(() => {
    fetchGames()
  }, [dispatch])

  const handleGameClick = (game: Game) => {
    setSelectedGame(game)
    setIsGameModalOpen(true)
  }

  // 3. Llama a fetchGames al cerrar el modal
  const handleCloseGameModal = () => {
    setIsGameModalOpen(false)
    setSelectedGame(null)
    fetchGames()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl py-8 px-4 md:px-8 xl:px-16">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Juegos Destacados</h1>
          <p className="text-muted-foreground">Descubre los mejores juegos al mejor precio</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {games.map((game) => (
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

// Exporta la página envuelta en AppProvider
export default function Page() {
  return (
    <AppProvider>
      <GameStoreContent />
    </AppProvider>
  )
}