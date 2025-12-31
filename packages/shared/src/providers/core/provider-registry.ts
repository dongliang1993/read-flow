import { PROVIDER_CONFIGS } from '@read-flow/shared/providers/provider-config'
import type { ProviderConfig } from '@read-flow/shared/types'

export class ProviderRegistry {
  private providers: Map<string, ProviderConfig> = new Map()

  constructor() {
    this.loadDefaultProviders()
  }

  private loadDefaultProviders(): void {
    for (const [id, definition] of Object.entries(PROVIDER_CONFIGS)) {
      this.providers.set(id, definition)
    }
  }

  getProvider(id: string): ProviderConfig | undefined {
    return this.providers.get(id)
  }

  getAllProviders(): ProviderConfig[] {
    return Array.from(this.providers.values())
  }
}

export const providerRegistry = new ProviderRegistry()
