"use client"

import Image from "next/image"
import { X, Plus, Minus, Trash2, ShoppingBag, Star, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { useApp } from "../context/app-context"
import { formatPriceSimple } from "../utils/currency"
import type { Game } from "../types/game"
import React from "react"

// Lógica de recomendaciones
function getRecommendedGames({
  cart,
  games,
  user,
  purchases,
}: {
  cart: { game: Game }[]
  games: Game[]
  user: any
  purchases: any[]
}) {
  const cartIds = cart.map((item) => item.game.id)

  // Invitado: 4 mejores valorados que no estén en el carrito
  if (!user || user.isGuest) {
    return games
      .filter((g) => !cartIds.includes(g.id))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4)
  }

  // Logueado: 2 por similitud de categorías, 2 mejores valorados
  const purchasedIds = purchases.flatMap((p) => p.games.map((gi: any) => gi.game.id || gi.game._id || gi.gameId))
  const purchasedGames = games.filter((g) => purchasedIds.includes(g.id))
  const purchasedCategories = new Set(purchasedGames.flatMap((g) => g.categories))

  const similarByCategory = games
    .filter(
      (g) =>
        !cartIds.includes(g.id) &&
        !purchasedIds.includes(g.id) &&
        g.categories.some((cat) => purchasedCategories.has(cat))
    )
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 2)

  const similarIds = similarByCategory.map((g) => g.id)
  const bestRated = games
    .filter((g) => !cartIds.includes(g.id) && !similarIds.includes(g.id))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 2)

  return [...similarByCategory, ...bestRated]
}

export function CartSidebar({ games, fetchGames }: { games: Game[], fetchGames: () => void }) {
  const { state, dispatch } = useApp()
  const total = state.cart.reduce((sum, item) => sum + item.game.price * item.quantity, 0)
  const itemCount = state.cart.reduce((sum, item) => sum + item.quantity, 0)
  const recommendedGames = getRecommendedGames({
    cart: state.cart,
    games,
    user: state.user,
    purchases: state.purchases || [],
  })

  // Cambia la cantidad de un producto en el carrito y sincroniza con backend
  const updateQuantity = async (gameId: string, newQuantity: number) => {
    const item = state.cart.find(item => item.game.id === gameId)
    if (!item) return

    if (newQuantity <= 0) {
      dispatch({ type: "REMOVE_FROM_CART", payload: gameId })
    } else {
      if (newQuantity > item.game.stock) {
        alert("No puedes agregar más de lo disponible en stock.")
        return
      }
      if (state.user) {
        const userId = state.user._id || state.user.id
        await fetch(`http://localhost:3000/carro/${userId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productoId: gameId, cantidad: newQuantity })
        })
      }
      dispatch({ type: "UPDATE_CART_QUANTITY", payload: { gameId, quantity: newQuantity } })
    }
  }

  // Agrega un producto recomendado al carrito y sincroniza con backend
  const addRecommendedToCart = async (game: Game) => {
    if (!state.user) {
      dispatch({ type: "TOGGLE_LOGIN_MODAL" })
      return
    }
    const cartItem = state.cart.find(item => item.game.id === game.id)
    const newQuantity = (cartItem?.quantity || 0) + 1
    if (newQuantity > game.stock) {
      alert("No puedes agregar más de lo disponible en stock.")
      return
    }
    const userId = state.user._id || state.user.id
    await fetch(`http://localhost:3000/carro/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productoId: game.id, cantidad: newQuantity })
    })
    dispatch({ type: "ADD_TO_CART", payload: game })
  }

  // Checkout
  const handleCheckout = async () => {
    if (!state.user) {
      dispatch({ type: "TOGGLE_LOGIN_MODAL" })
      return
    }

    const productos = state.cart.map(item => ({
      productId: item.game.id,
      cantidad: item.quantity
    }))

    const userId = state.user._id || state.user.id

    const body = {
      userId,
      productos
    }

    const res = await fetch("http://localhost:3000/compra", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })

    if (res.ok) {
      dispatch({ type: "CLEAR_CART" })
      dispatch({ type: "TOGGLE_CART" })
      fetchGames()
      alert("¡Compra realizada con éxito!")
    } else {
      alert("Error al realizar la compra")
    }
  }

  return (
    <>
      {/* Overlay */}
      {state.isCartOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => dispatch({ type: "TOGGLE_CART" })}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-background border-l shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          state.isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full relative">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Carrito de Compras</h2>
              {itemCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {itemCount}
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={() => dispatch({ type: "TOGGLE_CART" })}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Área de productos y recomendaciones, cada uno con su propio scroll */}
          <div className="flex-1 p-4 pb-4 flex flex-col gap-6">
            {/* Cart Items con scroll propio */}
            <div
              className="flex flex-col gap-4 overflow-y-scroll"
              style={{ maxHeight: "300px", minHeight: "150px" }}
            >
              {state.cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Tu carrito está vacío</h3>
                  <p className="text-muted-foreground mb-4">Agrega algunos juegos para comenzar tu compra</p>
                  <Button onClick={() => dispatch({ type: "TOGGLE_CART" })}>Continuar Comprando</Button>
                </div>
              ) : (
                state.cart.map((item) => (
                  <div key={item.game.id} className="flex gap-3 p-3 border rounded-lg">
                    <Image
                      src={item.game.image || "/placeholder.svg"}
                      alt={item.game.name}
                      width={60}
                      height={80}
                      className="rounded object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-2 mb-1">{item.game.name}</h4>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-primary">{formatPriceSimple(item.game.price)}</span>
                        {item.game.originalPrice && (
                          <span className="text-xs text-muted-foreground line-through">
                            {formatPriceSimple(item.game.originalPrice)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => updateQuantity(item.game.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => updateQuantity(item.game.id, item.quantity + 1)}
                            disabled={item.quantity >= item.game.stock}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          onClick={() => updateQuantity(item.game.id, 0)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-right mt-2">
                        <span className="text-sm font-semibold">
                          Subtotal: {formatPriceSimple(item.game.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Recomendaciones con scroll propio */}
            {recommendedGames.length > 0 && (
              <div
                className="overflow-y-scroll flex flex-col"
                style={{ maxHeight: "300px", minHeight: "110px" }}
              >
                <Separator />
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">También te puede interesar</h3>
                </div>
                {recommendedGames.map((game, idx) => (
                  <Card
                    key={game.id}
                    className={`overflow-hidden min-h-[90px] mb-3 last:mb-0 shrink-0`}
                  >
                    <CardContent className="p-3">
                      <div className="flex gap-3">
                        <Image
                          src={game.image || "/placeholder.svg"}
                          alt={game.name}
                          width={50}
                          height={70}
                          className="rounded object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-2 mb-1">{game.name}</h4>
                          <div className="flex items-center gap-1 mb-2">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-medium">{Math.round(game.rating)}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            {game.categories.slice(0, 2).map((category) => (
                              <Badge key={category} variant="outline" className="text-xs px-1 py-0">
                                {category}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-primary">
                                {formatPriceSimple(game.price)}
                              </span>
                              {game.originalPrice && (
                                <span className="text-xs text-muted-foreground line-through">
                                  {formatPriceSimple(game.originalPrice)}
                                </span>
                              )}
                              {game.discount && (
                                <Badge variant="destructive" className="text-xs px-1 py-0">
                                  -{game.discount}%
                                </Badge>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs"
                              onClick={() => addRecommendedToCart(game)}
                              disabled={game.stock === 0}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Agregar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Footer fijo */}
          {state.cart.length > 0 && (
            <div className="absolute bottom-0 left-0 w-full border-t p-4 bg-background space-y-2 z-10">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>
                    Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
                  </span>
                  <span>{formatPriceSimple(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Envío</span>
                  <span className="text-green-600">Gratis</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{formatPriceSimple(total)}</span>
                </div>
              </div>
              <Button className="w-full" size="lg" onClick={handleCheckout}>
                {!state.user
                  ? "Iniciar Sesión para Comprar"
                  : state.user.isGuest
                  ? "Comprar como Invitado"
                  : "Proceder al Pago"}
              </Button>
              <Button variant="outline" className="w-full" onClick={() => dispatch({ type: "TOGGLE_CART" })}>
                Continuar Comprando
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}