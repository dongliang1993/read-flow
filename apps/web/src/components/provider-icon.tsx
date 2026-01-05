import { OpenAIIcon } from './icon/open-ai'

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
    default:
      return <OpenAIIcon className={className} />
  }
}
