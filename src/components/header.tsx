"use client"

import { ShoppingCart, User, History, Gamepad2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useApp } from "../context/app-context"

export function Header() {
  const { state, dispatch } = useApp()

  const cartItemsCount = state.cart.reduce((total, item) => total + item.quantity, 0)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center gap-6 pl-4">
          <div className="flex items-center gap-2">
            <Gamepad2 className="h-7 w-7 text-primary" />
            <span className="text-2xl font-bold">JosesitoStore</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {state.user && (
            <Button
              variant="ghost"
              size="lg"
              onClick={() => dispatch({ type: "TOGGLE_PURCHASE_HISTORY" })}
              className="hidden sm:flex px-5 py-2 text-base shadow-md"
            >
              <History className="h-5 w-5 mr-2" />
              Historial
            </Button>
          )}

          <Button
            variant="ghost"
            size="lg"
            className="relative px-5 py-2 text-base shadow-md"
            onClick={() => dispatch({ type: "TOGGLE_CART" })}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartItemsCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">
                {cartItemsCount}
              </Badge>
            )}
          </Button>

          {state.user ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-base">
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
              <Button
                variant="outline"
                size="lg"
                className="px-5 py-2 text-base shadow-md"
                onClick={() => dispatch({ type: "LOGOUT" })}
              >
                {state.user.isGuest ? "Salir" : "Cerrar Sesión"}
              </Button>
            </div>
          ) : (
            <Button
              size="lg"
              className="px-5 py-2 text-base shadow-md"
              onClick={() => dispatch({ type: "TOGGLE_LOGIN_MODAL" })}
            >
              <User className="h-5 w-5 mr-2" />
              Iniciar Sesión
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}