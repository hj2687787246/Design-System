export const PRICE_DECIMAL_PLACES = 3

const PRICE_FACTOR = 10 ** PRICE_DECIMAL_PLACES

export const normalizePriceNumber = (value: unknown) => {
  if (value === undefined || value === null || value === '') return undefined

  const nextValue = Number(value)
  if (!Number.isFinite(nextValue)) return undefined

  return Math.round((nextValue + Number.EPSILON) * PRICE_FACTOR) / PRICE_FACTOR
}

export const normalizePriceNumberOrZero = (value: unknown) => normalizePriceNumber(value) ?? 0

export const toPricePayload = (value: unknown) => {
  const normalizedValue = normalizePriceNumber(value)
  if (normalizedValue === undefined) return undefined

  return normalizedValue.toFixed(PRICE_DECIMAL_PLACES).replace(/\.?0+$/, '')
}

export const formatPriceNumber = (value: number) =>
  new Intl.NumberFormat('zh-CN', {
    maximumFractionDigits: PRICE_DECIMAL_PLACES,
  }).format(normalizePriceNumber(value) ?? 0)

const priceInputPattern = new RegExp(`^\\d*(?:\\.\\d{0,${PRICE_DECIMAL_PLACES}})?$`)
const lastValidPriceInputValues = new WeakMap<HTMLInputElement, string>()

export const isPriceInputTextAllowed = (value: string) => priceInputPattern.test(value)

const sanitizePriceInputText = (value: string) => {
  const [integerPart, ...decimalParts] = value.replace(/[^\d.]/g, '').split('.')
  if (!decimalParts.length) return integerPart

  return `${integerPart}.${decimalParts.join('').slice(0, PRICE_DECIMAL_PLACES)}`
}

export const enforcePriceInput = (event: Event) => {
  const input = event.target instanceof HTMLInputElement ? event.target : null
  if (!input) return

  if (isPriceInputTextAllowed(input.value)) {
    lastValidPriceInputValues.set(input, input.value)
    return
  }

  input.value = lastValidPriceInputValues.get(input) ?? sanitizePriceInputText(input.value)
}

export const preventInvalidPricePaste = (event: ClipboardEvent) => {
  const input = event.target instanceof HTMLInputElement ? event.target : null
  if (!input) return

  const pastedText = event.clipboardData?.getData('text') ?? ''
  if (!isPriceInputTextAllowed(pastedText)) {
    event.preventDefault()
  }
}
