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
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password, // <-- CAMBIO AQUÍ
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.message || "Credenciales incorrectas")
        setLoading(false)
        return
      }

      const data = await response.json()
      //console.log("LOGIN RESPONSE DATA:", data) // <-- AGREGA ESTE LOG
      dispatch({
        type: "LOGIN",
        payload: {
          _id: data.user.id,
          id: data.user.id,
          name: data.user.nombre,
          email: data.user.email,
          rol: data.user.rol, // <-- agrega esto
          isGuest: false,
        },
      })
      setEmail("")
      setPassword("")
      dispatch({ type: "TOGGLE_LOGIN_MODAL" })
    } catch (err) {
      setError("Error de red o servidor")
    } finally {
      setLoading(false)
    }
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
              disabled={loading}
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
              disabled={loading}
            />
          </div>

          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Ingresando..." : "Iniciar Sesión"}
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

          <Button variant="outline" className="w-full" onClick={handleGuestMode} disabled={loading}>
            Continuar como Invitado
          </Button>

          <div className="text-center">
            <Button type="button" variant="link" onClick={switchToRegister} className="text-sm" disabled={loading}>
              ¿No tienes cuenta? Regístrate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}