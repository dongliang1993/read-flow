import { OpenAIIcon } from './icon/open-ai'
import { AnthropicIcon } from './icon/anthropic'

import type { ProviderType } from '@read-flow/shared/types'

export const ProviderIcon = ({
  provider,
  className,
}: {
  provider: ProviderType
  className?: string
}) => {
  switch (provider) {
    case 'openai':
    case 'openai-compatible':
    case 'custom-openai':
      return <OpenAIIcon className={className} />
    case 'anthropic':
    case 'custom-anthropic':
      return <AnthropicIcon className={className} />
    default:
      return <OpenAIIcon className={className} />
  }
}
