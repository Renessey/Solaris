// lotes.js

// Objeto com as quantidades de lotes por quadra
export const quadras = {
  A: 49,
  B: 36,
  C: 16,
  D: 26,
  E: 18,
  F: 29,
  G: 20,
  H: 20,
  I: 15,
  J: 21,
  K: 17,
  L: 15,
  M: 24,
  N: 21,
  O: 24,
  P: 17,
  Q: 16,
  R: 19,
  S: 28,
  T: 21,
  U: 22,
  V: 25,
  X: 18,
  Z: 46
}

// Função que retorna os números de lotes conforme a quadra selecionada
export function getLotes(quadraSelecionada) {
  const total = quadras[quadraSelecionada]
  if (!total) return []
  return Array.from({ length: total }, (_, i) => i + 1)
}
