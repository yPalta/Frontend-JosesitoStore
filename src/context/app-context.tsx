"use client"

import type React from "react"
import { createContext, useContext, useReducer, type ReactNode } from "react"
import type { Game, CartItem, User, Purchase, UserRating, Comment } from "../types/game"

interface AppState {
  user: User | null
  cart: CartItem[]
  purchases: Purchase[]
  games: Game[]
  isLoginModalOpen: boolean
  isRegisterModalOpen: boolean
  isPurchaseHistoryOpen: boolean
  isCartOpen: boolean
  guestId: string | null
}

type AppAction =
  | { type: "LOGIN"; payload: User }
  | { type: "REGISTER"; payload: User }
  | { type: "LOGOUT" }
  | { type: "SET_GUEST"; payload: string }
  | { type: "ADD_TO_CART"; payload: Game }
  | { type: "REMOVE_FROM_CART"; payload: string }
  | { type: "UPDATE_CART_QUANTITY"; payload: { gameId: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "ADD_PURCHASE"; payload: Purchase }
  | { type: "ADD_RATING"; payload: { gameId: string; rating: UserRating } }
  | { type: "ADD_COMMENT"; payload: { gameId: string; comment: Comment } }
  | { type: "TOGGLE_LOGIN_MODAL" }
  | { type: "TOGGLE_REGISTER_MODAL" }
  | { type: "TOGGLE_PURCHASE_HISTORY" }
  | { type: "TOGGLE_CART" }
  | { type: "UPDATE_GAMES"; payload: Game[] }

const initialState: AppState = {
  user: null,
  cart: [],
  purchases: [],
  games: [],
  isLoginModalOpen: false,
  isRegisterModalOpen: false,
  isPurchaseHistoryOpen: false,
  isCartOpen: false,
  guestId: null,
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        user: action.payload,
        isLoginModalOpen: false,
        guestId: action.payload.isGuest ? action.payload.id : null,
      }
    case "REGISTER":
      return {
        ...state,
        user: action.payload,
        isRegisterModalOpen: false,
        guestId: null,
      }
    case "LOGOUT":
      return { ...state, user: null, guestId: null }
    case "SET_GUEST":
      return {
        ...state,
        guestId: action.payload,
        user: {
          id: action.payload,
          name: "Invitado",
          email: "",
          isGuest: true,
        },
      }
    case "ADD_TO_CART":
      const existingItem = state.cart.find((item) => item.game.id === action.payload.id)
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map((item) =>
            item.game.id === action.payload.id ? { ...item, quantity: item.quantity + 1 } : item,
          ),
        }
      }
      return {
        ...state,
        cart: [...state.cart, { game: action.payload, quantity: 1 }],
      }
    case "REMOVE_FROM_CART":
      return {
        ...state,
        cart: state.cart.filter((item) => item.game.id !== action.payload),
      }
    case "UPDATE_CART_QUANTITY":
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.game.id === action.payload.gameId ? { ...item, quantity: action.payload.quantity } : item,
        ),
      }
    case "CLEAR_CART":
      return { ...state, cart: [] }
    case "ADD_PURCHASE":
      return {
        ...state,
        purchases: [action.payload, ...state.purchases],
        cart: [],
      }
    case "ADD_RATING":
      return {
        ...state,
        games: state.games.map((game) =>
          game.id === action.payload.gameId
            ? {
                ...game,
                userRatings: [...(game.userRatings || []), action.payload.rating],
                rating: calculateNewRating(game, action.payload.rating.rating),
                reviewCount: game.reviewCount + 1,
              }
            : game,
        ),
      }
    case "ADD_COMMENT":
      return {
        ...state,
        games: state.games.map((game) =>
          game.id === action.payload.gameId
            ? {
                ...game,
                comments: [...(game.comments || []), action.payload.comment],
              }
            : game,
        ),
      }
    case "TOGGLE_LOGIN_MODAL":
      return { ...state, isLoginModalOpen: !state.isLoginModalOpen, isRegisterModalOpen: false }
    case "TOGGLE_REGISTER_MODAL":
      return { ...state, isRegisterModalOpen: !state.isRegisterModalOpen, isLoginModalOpen: false }
    case "TOGGLE_PURCHASE_HISTORY":
      return { ...state, isPurchaseHistoryOpen: !state.isPurchaseHistoryOpen }
    case "TOGGLE_CART":
      return { ...state, isCartOpen: !state.isCartOpen }
    case "UPDATE_GAMES":
      return { ...state, games: action.payload }
    default:
      return state
  }
}

function calculateNewRating(game: Game, newRating: number): number {
  const currentTotal = game.rating * game.reviewCount
  const newTotal = currentTotal + newRating
  const newCount = game.reviewCount + 1
  return Math.round((newTotal / newCount) * 10) / 10
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
} | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
