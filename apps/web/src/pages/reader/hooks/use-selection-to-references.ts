import { useEffect } from 'react'
import { createReferenceId } from '@/hooks/use-chat'
import { useMemoizedFn } from 'ahooks'

import type { TextSelection } from '@/utils/position'
import type { ChatReference } from '@read-flow/shared'

type UseSelectionToReferencesConfig = {
  afterTransform: (references: ChatReference[]) => void
}

const createReference = (selection: TextSelection) => {
  return {
    id: createReferenceId(),
    text: selection.text,
  }
}

export const useSelectionToReferences = (
  selection: TextSelection | null,
  config: UseSelectionToReferencesConfig
) => {
  const afterTransform = useMemoizedFn(config.afterTransform)

  useEffect(() => {
    const references: ChatReference[] = []

    if (selection) {
      references.push(createReference(selection))
    }

    afterTransform?.(references)
  }, [selection, afterTransform])
}
