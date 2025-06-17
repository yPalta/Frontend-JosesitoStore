export interface Game {
  id: string
  name: string
  image: string
  price: number
  originalPrice?: number
  discount?: number
  rating: number
  reviewCount: number
  categories: string[]
  stock: number
  description: string
  platform: string[]
  userRatings?: UserRating[]
  comments?: Comment[]
}

export interface UserRating {
  userId: string
  userName: string
  rating: number
  date: string
}

export interface Comment {
  id: string
  userId: string
  userName: string
  content: string
  date: string
  rating?: number
}

export interface CartItem {
  game: Game
  quantity: number
}

export interface User {
  id: string
  name: string
  email: string
  isGuest?: boolean
}

export interface Purchase {
  id: string
  date: string
  games: CartItem[]
  total: number
  status: "completed" | "pending" | "cancelled"
  userEmail?: string
}
