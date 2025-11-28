import { EventManager } from './event-manager'
import { StyleManager } from './style-manager'
import { wrappedFoliateView } from '@/types/view'
import { getDirection } from '@/lib/document'

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

export interface ProgressData {
  location: string
  sectionHref: string
  sectionLabel: string
  sectionId: number
  section: number
  pageinfo: any
  timeinfo: any
  range: any
}

export class FoliateViewerManager {
  private eventManager: EventManager
  private isInitialized = false
  private isDestroyed = false
  private config: FoliateViewerManagerConfig
  private view: FoliateView | null = null
  private styleManager: StyleManager | null = null
  private onProgressUpdate?: (progress: ProgressData, bookId: string) => void
  private onViewSettingsUpdate?: (settings: ViewSettings) => void

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
    const { doc } = event.detail
    if (!doc) return

    const writingDir = this.view?.renderer.setStyles && getDirection(doc)
    const { bookDoc, globalViewSettings } = this.config

    // Update view settings based on document
    const updatedSettings = {
      ...globalViewSettings,
      vertical:
        writingDir?.vertical ||
        globalViewSettings.writingMode?.includes('vertical') ||
        false,
      rtl:
        writingDir?.rtl ||
        globalViewSettings.writingMode?.includes('rl') ||
        false,
    }

    this.onViewSettingsUpdate?.(updatedSettings)
  }

  private handleRelocate = (event: CustomEvent) => {
    const detail = event.detail
    this.onProgressUpdate?.(
      {
        location: detail.cfi,
        sectionHref: detail.tocItem?.href || '',
        sectionLabel: detail.tocItem?.label || '',
        sectionId: detail.tocItem?.id ?? 0,
        section: detail.section,
        pageinfo: detail.location,
        timeinfo: detail.time,
        range: detail.range,
      },
      this.config.bookId
    )
  }

  private handleRendererRelocate = (event: CustomEvent) => {
    const detail = event.detail
    if (detail.reason !== 'scroll' && detail.reason !== 'page') return
  }

  private handleResize = (bookIds: string[]) => {
    if (this.styleManager) {
      const dimensions = this.getContainerDimensions()
      this.styleManager.updateLayout(dimensions)
    }
    this.checkLayoutStability()
  }

  private checkLayoutStability(): void {
    const foliateView = document.getElementById(
      `foliate-view-${this.config.bookId}`
    )
    if (!foliateView) {
      this.dispatchStableEvent()
      return
    }

    let frameCount = 0
    let lastLayout: {
      scrollWidth: number
      scrollHeight: number
      childCount: number
    } | null = null
    let stableFrames = 0

    const checkFrame = () => {
      frameCount++

      const currentLayout = {
        scrollWidth: foliateView.scrollWidth,
        scrollHeight: foliateView.scrollHeight,
        childCount: foliateView.children.length,
      }

      if (lastLayout) {
        const isStable =
          currentLayout.scrollWidth === lastLayout.scrollWidth &&
          currentLayout.scrollHeight === lastLayout.scrollHeight &&
          currentLayout.childCount === lastLayout.childCount

        if (isStable) {
          stableFrames++

          if (stableFrames >= 5) {
            setTimeout(() => this.dispatchStableEvent(), 150)
            return
          }
        } else {
          stableFrames = 0
        }
      }

      lastLayout = currentLayout

      if (frameCount < 15) {
        requestAnimationFrame(checkFrame)
      } else {
        setTimeout(() => this.dispatchStableEvent(), 100)
      }
    }

    setTimeout(() => requestAnimationFrame(checkFrame), 150)
  }

  private dispatchStableEvent(): void {
    window.dispatchEvent(
      new CustomEvent('foliate-layout-stable', {
        detail: { bookIds: [this.config.bookId] },
      })
    )
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

  setProgressCallback(
    callback: (progress: ProgressData, bookId: string) => void
  ): void {
    this.onProgressUpdate = callback
  }

  setViewSettingsCallback(callback: (settings: ViewSettings) => void): void {
    this.onViewSettingsUpdate = callback
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
