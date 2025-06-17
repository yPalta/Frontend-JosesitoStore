"use client"

import { useState } from "react"
import { Header } from "../components/header"
import { GameCard } from "../components/game-card"
import { GameModal } from "../components/game-modal"
import { LoginModal } from "../components/login-modal"
import { PurchaseHistoryModal } from "../components/purchase-history-modal"
import { AppProvider } from "../context/app-context"
import { games } from "../data/games"
import type { Game } from "../types/game"
// Importar el componente CartSidebar
import { CartSidebar } from "../components/cart-sidebar"
import { RegisterModal } from "../components/register-modal"
import { useApp } from "../context/app-context"
import React from "react"

function GameStoreContent() {
  const { dispatch } = useApp()
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [isGameModalOpen, setIsGameModalOpen] = useState(false)

  // Inicializar juegos en el contexto
  React.useEffect(() => {
    dispatch({ type: "UPDATE_GAMES", payload: games })
  }, [dispatch])

  const handleGameClick = (game: Game) => {
    setSelectedGame(game)
    setIsGameModalOpen(true)
  }

  const handleCloseGameModal = () => {
    setIsGameModalOpen(false)
    setSelectedGame(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Juegos Destacados</h1>
          <p className="text-muted-foreground">Descubre los mejores juegos al mejor precio</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {games.map((game) => (
            <GameCard key={game.id} game={game} onGameClick={handleGameClick} />
          ))}
        </div>
      </main>

      <GameModal game={selectedGame} isOpen={isGameModalOpen} onClose={handleCloseGameModal} />

      <LoginModal />
      <RegisterModal />
      <PurchaseHistoryModal />
      {/* Agregar el componente antes del cierre del div principal, después de los otros modales: */}
      <CartSidebar />
    </div>
  )
}

export default function GameStore() {
  return (
    <AppProvider>
      <GameStoreContent />
    </AppProvider>
  )
}
