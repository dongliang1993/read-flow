declare module 'epubjs' {
  export interface Location {
    start: {
      cfi: string
    }
    end: {
      cfi: string
    }
  }

  export interface Theme {
    fontSize(size: string): void
  }

  export interface Rendition {
    display(target?: string): Promise<void>
    prev(): Promise<void>
    next(): Promise<void>
    destroy(): void
    on(event: string, callback: (location: Location) => void): void
    themes: Theme
  }

  export interface Book {
    renderTo(
      element: HTMLElement,
      options?: {
        width?: string | number
        height?: string | number
        spread?: string
      }
    ): Rendition
    destroy(): void
  }

  export default function ePub(url: string): Book
}
