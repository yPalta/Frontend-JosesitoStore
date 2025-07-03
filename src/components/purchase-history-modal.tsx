"use client"

import { useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useApp } from "../context/app-context"
import { Button } from "@/components/ui/button"
import type { Game } from "../types/game"

export function PurchaseHistoryModal() {
  const { state, dispatch } = useApp()

  useEffect(() => {
    const fetchPurchases = async () => {
      if (!state.user || !state.user._id) return
      try {
        const res = await fetch(`http://localhost:3000/compra/historial/${state.user._id}`)
        if (!res.ok) return
        const data = await res.json()
        // Mapea la respuesta del backend al formato esperado por el frontend
        const mapped = data.map((purchase: any) => ({
          id: purchase._id,
          date: new Date(purchase.fecha).toLocaleString(),
          status: "completed",
          games: purchase.productos.map((item: any) => {
            const isPopulated = typeof item.productId === "object" && item.productId !== null
            let gameId = isPopulated
              ? item.productId._id || item.productId.id || ""
              : item.productId
            let gameName = isPopulated
              ? item.productId.name || item.productId.nombre || ""
              : ""
            // Si no está populado, busca el nombre en state.games
            if (!isPopulated) {
              const found = state.games.find(g => g.id === gameId)
              gameName = found ? found.name : `ID: ${gameId}`
            }
            return {
              game: {
                id: gameId,
                name: gameName,
              } as Game,
              quantity: item.cantidad,
            }
          }),
        }))
        dispatch({ type: "SET_PURCHASES", payload: mapped })
      } catch (err) {
        // Manejo de error opcional
      }
    }
    if (state.isPurchaseHistoryOpen) {
      fetchPurchases()
    }
  }, [state.isPurchaseHistoryOpen, state.user?._id, dispatch, state.games])

  return (
    <Dialog open={state.isPurchaseHistoryOpen} onOpenChange={() => dispatch({ type: "TOGGLE_PURCHASE_HISTORY" })}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Historial de Compras</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!state.user || state.user.isGuest ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                El historial de compras solo está disponible para usuarios registrados.
              </p>
              <Button
                onClick={() => {
                  dispatch({ type: "TOGGLE_PURCHASE_HISTORY" })
                  dispatch({ type: "TOGGLE_REGISTER_MODAL" })
                }}
              >
                Registrarse Ahora
              </Button>
            </div>
          ) : state.purchases.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No tienes compras realizadas aún.</p>
          ) : (
            state.purchases.map((purchase) => (
              <Card key={purchase.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold">Pedido #{purchase.id}</p>
                      <p className="text-sm text-muted-foreground">{purchase.date}</p>
                    </div>
                    <Badge variant={purchase.status === "completed" ? "default" : "secondary"}>
                      {purchase.status === "completed" ? "Completado" : "Pendiente"}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-3">
                    {purchase.games.map((item) => (
                      <div key={item.game.id} className="flex justify-between text-sm">
                        <span>
                          {item.game.name} x{item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}