export function formatFine(fine: number): string {
  const n = Math.floor(fine)
  return `-$${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}`
}
