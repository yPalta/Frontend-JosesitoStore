"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useApp } from "../context/app-context"

export function RegisterModal() {
  const { state, dispatch } = useApp()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido"
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido"
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida"
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: formData.name,
          email: formData.email,
          password: formData.password,
          rol: "usuario",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setErrors({ email: errorData.message || "Error al registrar usuario" })
        setLoading(false)
        return
      }

      // Registro exitoso
      setFormData({ name: "", email: "", password: "", confirmPassword: "" })
      setErrors({})
      dispatch({ type: "TOGGLE_REGISTER_MODAL" })
      // Aquí podrías mostrar un mensaje de éxito o redirigir al login

    } catch (error) {
      setErrors({ email: "Error de red o servidor" })
    } finally {
      setLoading(false)
    }
  }

  const switchToLogin = () => {
    dispatch({ type: "TOGGLE_REGISTER_MODAL" })
    dispatch({ type: "TOGGLE_LOGIN_MODAL" })
  }

  return (
    <Dialog open={state.isRegisterModalOpen} onOpenChange={() => dispatch({ type: "TOGGLE_REGISTER_MODAL" })}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Cuenta</DialogTitle>
          <DialogDescription>Regístrate para acceder a todas las funcionalidades</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre completo</Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Tu nombre completo"
              className={errors.name ? "border-red-500" : ""}
              disabled={loading}
            />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="tu@email.com"
              className={errors.email ? "border-red-500" : ""}
              disabled={loading}
            />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              className={errors.password ? "border-red-500" : ""}
              disabled={loading}
            />
            {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="••••••••"
              className={errors.confirmPassword ? "border-red-500" : ""}
              disabled={loading}
            />
            {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creando..." : "Crear Cuenta"}
          </Button>

          <div className="text-center">
            <Button type="button" variant="link" onClick={switchToLogin} className="text-sm" disabled={loading}>
              ¿Ya tienes cuenta? Inicia sesión
            </Button>
          </div>
        </form>
      </DialogContent>
      </Dialog>
  )
}