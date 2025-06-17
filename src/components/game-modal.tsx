"use client"

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
  const { dispatch } = useApp()

  if (!game) return null

  const handleAddToCart = () => {
    dispatch({ type: "ADD_TO_CART", payload: game })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{game.name}</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative">
            <Image
              src={game.image || "/placeholder.svg"}
              alt={game.name}
              width={400}
              height={600}
              className="w-full h-96 object-cover rounded-lg"
            />
            {game.discount && (
              <Badge className="absolute top-4 left-4 bg-red-500 text-lg px-3 py-1">-{game.discount}%</Badge>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-lg">{game.rating}</span>
              <span className="text-muted-foreground">({game.reviewCount.toLocaleString()} reseñas)</span>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Categorías</h4>
              <div className="flex flex-wrap gap-2">
                {game.categories.map((category) => (
                  <Badge key={category} variant="outline">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Plataformas</h4>
              <div className="flex flex-wrap gap-2">
                {game.platform.map((platform) => (
                  <Badge key={platform} variant="secondary">
                    {platform}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Descripción</h4>
              <p className="text-muted-foreground leading-relaxed">{game.description}</p>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-primary">{formatPriceSimple(game.price)}</span>
                    {game.originalPrice && (
                      <span className="text-xl text-muted-foreground line-through">
                        {formatPriceSimple(game.originalPrice)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Stock disponible: {game.stock} unidades</p>
                </div>
              </div>

              <Button size="lg" className="w-full" onClick={handleAddToCart} disabled={game.stock === 0}>
                <ShoppingCart className="h-5 w-5 mr-2" />
                {game.stock === 0 ? "Sin Stock" : "Agregar al Carrito"}
              </Button>
            </div>
          </div>
        </div>

        {/* Rating and Comments Section */}
        <div className="mt-6">
          <RatingSystem game={game} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
