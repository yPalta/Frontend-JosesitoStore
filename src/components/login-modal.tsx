"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { useApp } from "../context/app-context"

export function LoginModal() {
  const { state, dispatch } = useApp()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulamos un login exitoso
    dispatch({
      type: "LOGIN",
      payload: {
        id: Date.now().toString(),
        name: email.split("@")[0],
        email: email,
        isGuest: false,
      },
    })
    setEmail("")
    setPassword("")
  }

  const handleGuestMode = () => {
    const guestId = `guest_${Date.now()}`
    dispatch({ type: "SET_GUEST", payload: guestId })
  }

  const switchToRegister = () => {
    dispatch({ type: "TOGGLE_LOGIN_MODAL" })
    dispatch({ type: "TOGGLE_REGISTER_MODAL" })
  }

  return (
    <Dialog open={state.isLoginModalOpen} onOpenChange={() => dispatch({ type: "TOGGLE_LOGIN_MODAL" })}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Iniciar Sesión</DialogTitle>
          <DialogDescription>Accede a tu cuenta o continúa como invitado</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Iniciar Sesión
          </Button>
        </form>

        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">O</span>
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={handleGuestMode}>
            Continuar como Invitado
          </Button>

          <div className="text-center">
            <Button type="button" variant="link" onClick={switchToRegister} className="text-sm">
              ¿No tienes cuenta? Regístrate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
