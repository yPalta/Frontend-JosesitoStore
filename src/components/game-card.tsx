"use client"

import type React from "react"

import Image from "next/image"
import { Star, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Game } from "../types/game"
import { useApp } from "../context/app-context"
import { formatPriceSimple } from "../utils/currency"

interface GameCardProps {
  game: Game
  onGameClick: (game: Game) => void
}

export function GameCard({ game, onGameClick }: GameCardProps) {
  const { dispatch } = useApp()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    dispatch({ type: "ADD_TO_CART", payload: game })
  }

  return (
    <Card
      className="group cursor-pointer transition-all hover:shadow-lg hover:scale-105"
      onClick={() => onGameClick(game)}
    >
      <CardContent className="p-0">
        <div className="relative">
          <Image
            src={game.image || "/placeholder.svg"}
            alt={game.name}
            width={200}
            height={300}
            className="w-full h-64 object-cover rounded-t-lg"
          />
          {game.discount && <Badge className="absolute top-2 left-2 bg-red-500">-{game.discount}%</Badge>}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              size="sm"
              onClick={handleAddToCart}
              className="transform translate-y-4 group-hover:translate-y-0 transition-transform"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Agregar al Carrito
            </Button>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-sm mb-2 line-clamp-2 h-10">{game.name}</h3>

          <div className="flex items-center gap-1 mb-2">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{game.rating}</span>
            <span className="text-xs text-muted-foreground">({game.reviewCount.toLocaleString()})</span>
          </div>

          <div className="flex flex-wrap gap-1 mb-3">
            {game.categories.slice(0, 2).map((category) => (
              <Badge key={category} variant="secondary" className="text-xs">
                {category}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">{formatPriceSimple(game.price)}</span>
              {game.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPriceSimple(game.originalPrice)}
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">Stock: {game.stock}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
