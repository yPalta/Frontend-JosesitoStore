"use client"
import { useState } from "react"
import { Star, MessageCircle, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { Game, UserRating, Comment } from "../types/game"
import { useApp } from "../context/app-context"

interface RatingSystemProps {
  game: Game
  comments: any[]
  loading?: boolean
  setComments?: (comments: any[]) => void
  reloadGame?: () => void
}

export function RatingSystem({ game, comments, loading, setComments, reloadGame }: RatingSystemProps) {
  const { state, dispatch } = useApp()
  const [userRating, setUserRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [showCommentForm, setShowCommentForm] = useState(false)

  // Unifica comentarios estructurados y simples (strings)
  const allComments =
    (comments && comments.length > 0
      ? comments
      : game.comments && game.comments.length > 0
      ? game.comments
      : []) || []

  // Verifica si el usuario ya comentó o valoró
  const userAlreadyCommented = state.user
    ? allComments.some(
        (c: any) =>
          (typeof c === "object" && (c.userId === state.user?.id || c.userName === state.user?.name))
      )
    : false

  const handleRatingSubmit = async () => {
    if (!state.user || userRating === 0 || userAlreadyCommented) return

    await fetch(`http://localhost:3000/producto/${game.id}/valoracion`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ valoracion: userRating }),
    })

    setUserRating(0)

    // Recarga comentarios/valoraciones después de enviar
    if (typeof window !== "undefined" && typeof setComments === "function") {
      setTimeout(() => {
        fetch(`http://localhost:3000/producto/${game.id}/valoraciones`)
          .then(res => res.json())
          .then(data => {
            setComments(data.comentarios || [])
          })
      }, 300)
    }
    if (typeof reloadGame === "function") {
      reloadGame()
    }
  }

  const handleCommentSubmit = async () => {
    if (!state.user || !comment.trim() || userAlreadyCommented) return

    await fetch(`http://localhost:3000/producto/${game.id}/comentario`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comentario: comment.trim(), valoracion: userRating }),
    })

    setComment("")
    setUserRating(0)
    setShowCommentForm(false)

    // Recarga comentarios después de enviar
    if (typeof window !== "undefined" && typeof setComments === "function") {
      setTimeout(() => {
        fetch(`http://localhost:3000/producto/${game.id}/valoraciones`)
          .then(res => res.json())
          .then(data => {
            setComments(data.comentarios || [])
          })
      }, 300)
    }
    if (typeof reloadGame === "function") {
      reloadGame()
    }
  }

  const requiresAuth = () => {
    if (!state.user) {
      dispatch({ type: "TOGGLE_LOGIN_MODAL" })
      return true
    }
    return false
  }

  return (
    <div className="space-y-6">
      {/* Rating Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Valoración</h3>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-lg">{Math.round(Number(game.rating))}</span>
            <span className="text-muted-foreground">({game.reviewCount} valoraciones)</span>
          </div>
        </div>

        {state.user && !userAlreadyCommented && (
          <div className="space-y-3">
            <p className="text-sm font-medium">Tu valoración:</p>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="transition-colors"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setUserRating(star)}
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= (hoverRating || userRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
              {userRating > 0 && (
                <Button size="sm" onClick={handleRatingSubmit} className="ml-2">
                  Enviar Valoración
                </Button>
              )}
            </div>
          </div>
        )}

        {state.user && userAlreadyCommented && (
          <div className="text-sm text-muted-foreground">
            Ya enviaste tu valoración o comentario para este juego.
          </div>
        )}
      </div>

      <Separator />

      {/* Comments Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Comentarios ({allComments.length})
          </h3>

          {state.user && !userAlreadyCommented && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (requiresAuth()) return
                setShowCommentForm(!showCommentForm)
              }}
            >
              {showCommentForm ? "Cancelar" : "Escribir Comentario"}
            </Button>
          )}
        </div>

        {/* Comment Form */}
        {showCommentForm && state.user && !userAlreadyCommented && (
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Valoración opcional:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setUserRating(userRating === star ? 0 : star)}>
                    <Star
                      className={`h-4 w-4 ${star <= userRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  </button>
                ))}
              </div>

              <Textarea
                placeholder="Escribe tu comentario sobre este juego..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCommentForm(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCommentSubmit} disabled={!comment.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  Publicar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Comments List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando comentarios...</div>
          ) : allComments.length > 0 ? (
            allComments.map((comment: any, idx: number) => (
              <Card key={comment.id || comment._id || idx}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {typeof comment === "string"
                          ? "Usuario"
                          : comment.userName || comment.usuario || "Usuario"}
                      </span>
                      {comment.rating || comment.valoracion ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{comment.rating || comment.valoracion}</span>
                        </div>
                      ) : null}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {typeof comment === "string"
                        ? ""
                        : comment.date || comment.fecha || ""}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">
                    {typeof comment === "string"
                      ? comment
                      : comment.content || comment.comentario}
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No hay comentarios aún</p>
              <p className="text-sm">¡Sé el primero en comentar!</p>
            </div>
          )}
        </div>

        {!state.user && (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-2">¿Quieres valorar o comentar?</p>
            <Button onClick={() => dispatch({ type: "TOGGLE_LOGIN_MODAL" })}>Iniciar Sesión</Button>
          </div>
        )}
      </div>
    </div>
  )
}