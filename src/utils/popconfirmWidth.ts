const MIN_POPCONFIRM_WIDTH = 220
const MAX_POPCONFIRM_WIDTH = 420
const POPCONFIRM_HORIZONTAL_PADDING = 56

const isAscii = (char: string) => char.charCodeAt(0) <= 0x7f

export const getPopconfirmWidth = (title: string) => {
  const textWidth = Array.from(title).reduce((width, char) => width + (isAscii(char) ? 7 : 15), 0)
  const estimatedWidth = textWidth + POPCONFIRM_HORIZONTAL_PADDING

  return Math.min(Math.max(estimatedWidth, MIN_POPCONFIRM_WIDTH), MAX_POPCONFIRM_WIDTH)
}
