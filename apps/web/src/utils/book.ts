export interface LanguageMap {
  [key: string]: string
}

export interface Contributor {
  name: string
}

/**
 * 尝试去除文件扩展名，如果文件扩展名是 .epub，则去除 .epub
 * @param book - The book to get the display title for.
 * @returns
 */
export const getBookDisplayTitle = (bookTitle?: string) => {
  if (!bookTitle) {
    return ''
  }

  return bookTitle.replace(/\.[^.]+$/, '')
}
