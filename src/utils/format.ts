const kgFormat = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 })

export const formatKg = (value: number): string => kgFormat.format(value)
