import { EventManager } from './event-manager'
import { StyleManager } from './style-manager'
import { wrappedFoliateView } from '@/types/view'

import type { ViewSettings } from '@/types/settings'
import type { FoliateView } from '@/types/view'
import type { BookConfig, BookDoc } from '@/types/book'
import type { Insets } from '@/types/misc'
import type { LayoutDimensions } from './style-manager'
export interface FoliateViewerManagerConfig {
  bookId: string
  bookDoc: BookDoc
  config: BookConfig
  insets: Insets
  container: HTMLElement
  globalViewSettings: ViewSettings
  onViewCreated?: (view: FoliateView) => void
}

export class FoliateViewerManager {
  private eventManager: EventManager
  private isInitialized = false
  private isDestroyed = false
  private config: FoliateViewerManagerConfig
  private view: FoliateView | null = null
  private styleManager: StyleManager | null = null

  constructor(config: FoliateViewerManagerConfig) {
    this.config = config
    this.eventManager = new EventManager()
  }

  async initialize() {
    if (this.isInitialized || this.isDestroyed) {
      throw new Error('Manager already initialized or destroyed')
    }

    try {
      await this.createFoliateView()
      await this.setupEventHandlers()
      await this.openBook()
      await this.initializeStyles()
      await this.navigateToInitialPosition()

      this.isInitialized = true
    } catch (error) {
      console.error('[FoliateViewerManager] Initialization failed:', error)
      throw error
    }
  }

  private async createFoliateView(): Promise<void> {
    await import('foliate-js/view.js')
    const view = wrappedFoliateView(
      document.createElement('foliate-view') as FoliateView
    )
    view.id = `foliate-view-${this.config.bookId}`

    this.config.container.appendChild(view)
    this.view = view
    this.eventManager = new EventManager(view)

    // Notify that view is created and ready for use
    if (this.config.onViewCreated) {
      this.config.onViewCreated(view)
    }
  }

  private handleLoad = (event: CustomEvent) => {
    console.log('handleLoad', event)
  }

  private handleRelocate = (event: CustomEvent) => {
    console.log('handleRelocate', event)
  }

  private handleRendererRelocate = (event: CustomEvent) => {
    console.log('handleRendererRelocate', event)
  }

  private handleResize = (bookIds: string[]) => {
    console.log('handleResize', bookIds)
  }

  private handleMessage = (event: MessageEvent) => {
    console.log('handleMessage', event)
  }

  private async setupEventHandlers(): Promise<void> {
    if (!this.view) {
      return
    }

    this.eventManager.setupFoliateEventHandlers({
      onLoad: this.handleLoad,
      onRelocate: this.handleRelocate,
      onRendererRelocate: this.handleRendererRelocate,
    })

    this.eventManager.setupGlobalEventListeners(this.config.bookId, {
      onResize: this.handleResize,
      onMessage: this.handleMessage,
    })
  }

  private async openBook(): Promise<void> {
    if (!this.view) return

    const { bookDoc } = this.config

    await this.view.open(bookDoc)
  }

  private async initializeStyles(): Promise<void> {
    if (!this.view) {
      return
    }

    const { globalViewSettings } = this.config
    const dimensions = this.getContainerDimensions()

    this.styleManager = new StyleManager(this.view, globalViewSettings)
    this.styleManager.updateLayout(dimensions)
    this.styleManager.applyStyles()
  }

  private async navigateToInitialPosition(): Promise<void> {
    if (!this.view) return

    await this.view.goToFraction(0)
  }

  getView(): FoliateView | null {
    return this.view
  }

  destroy(): void {
    if (this.isDestroyed) return

    try {
      this.view?.close()
      this.view?.remove()
      this.view = null
      this.isDestroyed = true
      this.isInitialized = false
    } catch (error) {
      console.error('[FoliateViewerManager] Destruction failed:', error)
      throw error
    }
  }

  private getContainerDimensions(): LayoutDimensions {
    const { container, insets } = this.config
    const rect = container.getBoundingClientRect()
    return {
      width: rect.width - insets.left - insets.right,
      height: rect.height - insets.top - insets.bottom,
    }
  }
}
