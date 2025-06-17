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
}

export function RatingSystem({ game }: RatingSystemProps) {
  const { state, dispatch } = useApp()
  const [userRating, setUserRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [showCommentForm, setShowCommentForm] = useState(false)

  const handleRatingSubmit = () => {
    if (!state.user || userRating === 0) return

    const newRating: UserRating = {
      userId: state.user.id,
      userName: state.user.name,
      rating: userRating,
      date: new Date().toLocaleDateString(),
    }

    dispatch({ type: "ADD_RATING", payload: { gameId: game.id, rating: newRating } })
    setUserRating(0)
  }

  const handleCommentSubmit = () => {
    if (!state.user || !comment.trim()) return

    const newComment: Comment = {
      id: Date.now().toString(),
      userId: state.user.id,
      userName: state.user.name,
      content: comment.trim(),
      date: new Date().toLocaleDateString(),
      rating: userRating > 0 ? userRating : undefined,
    }

    dispatch({ type: "ADD_COMMENT", payload: { gameId: game.id, comment: newComment } })
    setComment("")
    setUserRating(0)
    setShowCommentForm(false)
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
            <span className="font-semibold text-lg">{game.rating}</span>
            <span className="text-muted-foreground">({game.reviewCount} valoraciones)</span>
          </div>
        </div>

        {state.user && (
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
      </div>

      <Separator />

      {/* Comments Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Comentarios ({game.comments?.length || 0})
          </h3>

          {state.user && (
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
        {showCommentForm && state.user && (
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
          {game.comments && game.comments.length > 0 ? (
            game.comments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{comment.userName}</span>
                      {comment.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{comment.rating}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">{comment.date}</span>
                  </div>
                  <p className="text-sm leading-relaxed">{comment.content}</p>
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
