"use client"

import Image from "next/image"
import { X, Plus, Minus, Trash2, ShoppingBag, Star, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { useApp } from "../context/app-context"
import { games } from "../data/games"
import { getRecommendedGames } from "../utils/recommendations"
import { formatPriceSimple } from "../utils/currency"

export function CartSidebar() {
  const { state, dispatch } = useApp()

  const total = state.cart.reduce((sum, item) => sum + item.game.price * item.quantity, 0)
  const itemCount = state.cart.reduce((sum, item) => sum + item.quantity, 0)

  // Obtener productos recomendados
  const recommendedGames = getRecommendedGames(state.cart, games, 4)

  const updateQuantity = (gameId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      dispatch({ type: "REMOVE_FROM_CART", payload: gameId })
    } else {
      dispatch({ type: "UPDATE_CART_QUANTITY", payload: { gameId, quantity: newQuantity } })
    }
  }

  const handleCheckout = () => {
    if (!state.user) {
      dispatch({ type: "TOGGLE_LOGIN_MODAL" })
      return
    }

    // Simular compra
    const purchase = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      games: [...state.cart],
      total: total,
      status: "completed" as const,
      userEmail: state.user.isGuest ? undefined : state.user.email,
    }

    dispatch({ type: "ADD_PURCHASE", payload: purchase })
    dispatch({ type: "TOGGLE_CART" })

    // Mostrar mensaje diferente para invitados
    if (state.user.isGuest) {
      alert("¡Compra realizada! Para ver tu historial de compras, regístrate con una cuenta.")
    }
  }

  const addRecommendedToCart = (game: (typeof games)[0]) => {
    dispatch({ type: "ADD_TO_CART", payload: game })
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
        <div className="flex flex-col h-full">
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

          {/* Cart Items */}
          <ScrollArea className="flex-1 p-4">
            {state.cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Tu carrito está vacío</h3>
                <p className="text-muted-foreground mb-4">Agrega algunos juegos para comenzar tu compra</p>
                <Button onClick={() => dispatch({ type: "TOGGLE_CART" })}>Continuar Comprando</Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Cart Items */}
                <div className="space-y-4">
                  {state.cart.map((item) => (
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
                            onClick={() => dispatch({ type: "REMOVE_FROM_CART", payload: item.game.id })}
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
                  ))}
                </div>

                {/* Recommended Products */}
                {recommendedGames.length > 0 && (
                  <div className="space-y-3">
                    <Separator />
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold text-sm">También te puede interesar</h3>
                    </div>

                    <div className="space-y-3">
                      {recommendedGames.map((game) => (
                        <Card key={game.id} className="overflow-hidden">
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
                                  <span className="text-xs font-medium">{game.rating}</span>
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
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Footer with Total and Checkout */}
          {state.cart.length > 0 && (
            <div className="border-t p-4 space-y-4">
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

              <div className="space-y-2">
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
            </div>
          )}
        </div>
      </div>
    </>
  )
}
