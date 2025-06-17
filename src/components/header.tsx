"use client"

import { ShoppingCart, User, History, Search, Gamepad2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useApp } from "../context/app-context"

export function Header() {
  const { state, dispatch } = useApp()

  const cartItemsCount = state.cart.reduce((total, item) => total + item.quantity, 0)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Gamepad2 className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">JosesitoStore</span>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Buscar juegos..." className="pl-10" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {state.user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch({ type: "TOGGLE_PURCHASE_HISTORY" })}
              className="hidden sm:flex"
            >
              <History className="h-4 w-4 mr-2" />
              Historial
            </Button>
          )}

          <Button variant="ghost" size="sm" className="relative" onClick={() => dispatch({ type: "TOGGLE_CART" })}>
            <ShoppingCart className="h-4 w-4" />
            {cartItemsCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {cartItemsCount}
              </Badge>
            )}
          </Button>

          {state.user ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-sm">
                Hola, {state.user.isGuest ? "Invitado" : state.user.name}
                {state.user.isGuest && (
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto ml-1 text-xs"
                    onClick={() => dispatch({ type: "TOGGLE_REGISTER_MODAL" })}
                  >
                    (Registrarse)
                  </Button>
                )}
              </span>
              <Button variant="outline" size="sm" onClick={() => dispatch({ type: "LOGOUT" })}>
                {state.user.isGuest ? "Salir" : "Cerrar Sesión"}
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={() => dispatch({ type: "TOGGLE_LOGIN_MODAL" })}>
              <User className="h-4 w-4 mr-2" />
              Iniciar Sesión
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
