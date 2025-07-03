"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Star, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Game } from "../types/game"
import { useApp } from "../context/app-context"
import { RatingSystem } from "./rating-system"
import { formatPriceSimple } from "../utils/currency"

interface GameModalProps {
  game: Game | null
  isOpen: boolean
  onClose: () => void
}

export function GameModal({ game, isOpen, onClose }: GameModalProps) {
  const { state, dispatch } = useApp()
  const [comments, setComments] = useState<any[]>([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [currentGame, setCurrentGame] = useState<Game | null>(game)

  // Recarga el producto (para actualizar promedio y cantidad de valoraciones)
  const reloadGame = async () => {
    if (!game) return
    const res = await fetch(`http://localhost:3000/producto/id/${game.id}`)
    const data = await res.json()
    setCurrentGame({
      ...data,
      id: data._id,
      name: data.nombre,
      categories: data.categories || data.categorias || [],
      image: data.image || data.imageUrl || data.urlImagen || "",
      platform: data.platform || [],
      description: data.description || "",
      rating: data.promedioValoracion,
      reviewCount: data.cantidadValoraciones,
      price: data.precio,
      originalPrice: typeof data.originalPrice === "number" ? data.originalPrice : undefined,
      stock: data.stock,
      discount: typeof data.discount === "number" ? data.discount : undefined,
    })
  }

  // Actualiza currentGame cuando cambia el juego recibido por prop
  useEffect(() => {
    if (!game) return
    setCurrentGame({
      ...game,
      id: (game as any)._id || game.id,
      name: (game as any).nombre || game.name,
      categories: (game as any).categories || (game as any).categorias || [],
      image: (game as any).image || (game as any).imageUrl || (game as any).urlImagen || "",
      platform: (game as any).platform || [],
      description: (game as any).description || "",
      rating: (game as any).promedioValoracion ?? game.rating,
      reviewCount: (game as any).cantidadValoraciones ?? game.reviewCount,
      price: (game as any).precio ?? game.price,
      originalPrice: typeof (game as any).originalPrice === "number"
        ? (game as any).originalPrice
        : undefined,
      stock: (game as any).stock ?? game.stock,
      discount: typeof (game as any).discount === "number"
        ? (game as any).discount
        : undefined,
    })
  }, [game])

  // Recarga comentarios y actualiza promedio/cantidad cuando se abre el modal o cambia el juego
  useEffect(() => {
    if (isOpen && game) {
      setLoadingComments(true)
      fetch(`http://localhost:3000/producto/${game.id}/valoraciones`)
        .then(res => res.json())
        .then(data => {
          setComments(data.comentarios || [])
          setCurrentGame(prev => prev ? {
            ...prev,
            rating: data.promedioValoracion,
            reviewCount: data.cantidadValoraciones
          } : prev)
        })
        .catch(() => setComments([]))
        .finally(() => setLoadingComments(false))
    }
  }, [isOpen, game])

  if (!currentGame) return null

  // Agregar al carrito con control de stock y sincronización backend
  const handleAddToCart = async () => {
    if (!state.user) {
      dispatch({ type: "TOGGLE_LOGIN_MODAL" })
      return
    }
    const cartItem = state.cart.find(item => item.game.id === currentGame.id)
    const newQuantity = (cartItem?.quantity || 0) + 1
    if (newQuantity > currentGame.stock) {
      alert("No puedes agregar más de lo disponible en stock.")
      return
    }
    await fetch(`http://localhost:3000/carro/${state.user.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productoId: currentGame.id, cantidad: newQuantity })
    })
    dispatch({ type: "ADD_TO_CART", payload: currentGame })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{currentGame.name}</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative">
            <Image
              src={currentGame.image || "/placeholder.svg"}
              alt={currentGame.name}
              width={400}
              height={600}
              className="w-full h-96 object-cover rounded-lg"
            />
            {currentGame.discount && (
              <Badge className="absolute top-4 left-4 bg-red-500 text-lg px-3 py-1">-{currentGame.discount}%</Badge>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-lg">{Math.round(Number(currentGame.rating))}</span>
              <span className="text-muted-foreground">({currentGame.reviewCount?.toLocaleString() ?? 0} reseñas)</span>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Categorías</h4>
              <div className="flex flex-wrap gap-2">
                {(currentGame.categories || []).map((category: string) => (
                  <Badge key={category} variant="outline">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Plataformas</h4>
              <div className="flex flex-wrap gap-2">
                {(currentGame.platform || []).map((platform: string) => (
                  <Badge key={platform} variant="secondary">
                    {platform}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Descripción</h4>
              <p className="text-muted-foreground leading-relaxed">{currentGame.description}</p>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-primary">{formatPriceSimple(currentGame.price)}</span>
                    {currentGame.originalPrice && (
                      <span className="text-xl text-muted-foreground line-through">
                        {formatPriceSimple(currentGame.originalPrice)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Stock disponible: {currentGame.stock} unidades</p>
                </div>
              </div>

              <Button size="lg" className="w-full" onClick={handleAddToCart} disabled={currentGame.stock === 0}>
                <ShoppingCart className="h-5 w-5 mr-2" />
                {currentGame.stock === 0 ? "Sin Stock" : "Agregar al Carrito"}
              </Button>
            </div>
          </div>
        </div>

        {/* Rating and Comments Section */}
        <div className="mt-6">
          <RatingSystem
            game={currentGame}
            comments={comments}
            loading={loadingComments}
            setComments={setComments}
            reloadGame={reloadGame}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}