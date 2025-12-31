import type { ProviderIds } from '@read-flow/shared/providers/provider-config'

export type ApiKeySettings = {
  [K in ProviderIds | string]?: string
} & {
  [K in `custom_${string}`]?: string
}
