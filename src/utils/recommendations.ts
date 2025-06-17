import type { Game, CartItem } from "../types/game"

export function getRecommendedGames(cartItems: CartItem[], allGames: Game[], maxRecommendations = 3): Game[] {
  if (cartItems.length === 0) {
    // Si el carrito está vacío, mostrar juegos populares (por rating)
    return allGames
      .filter((game) => game.stock > 0)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, maxRecommendations)
  }

  // Obtener categorías de los juegos en el carrito
  const cartCategories = cartItems.flatMap((item) => item.game.categories)
  const cartGameIds = cartItems.map((item) => item.game.id)

  // Encontrar juegos que no están en el carrito
  const availableGames = allGames.filter((game) => !cartGameIds.includes(game.id) && game.stock > 0)

  // Calcular puntuación de relevancia para cada juego
  const scoredGames = availableGames.map((game) => {
    let score = 0

    // Puntos por categorías compartidas
    const sharedCategories = game.categories.filter((cat) => cartCategories.includes(cat)).length
    score += sharedCategories * 3

    // Puntos por rating alto
    score += game.rating

    // Puntos extra por descuentos
    if (game.discount) {
      score += 1
    }

    // Puntos por popularidad (número de reseñas)
    score += Math.log(game.reviewCount) * 0.1

    return { game, score }
  })

  // Ordenar por puntuación y devolver los mejores
  return scoredGames
    .sort((a, b) => b.score - a.score)
    .slice(0, maxRecommendations)
    .map((item) => item.game)
}
