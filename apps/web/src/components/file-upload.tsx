import { useRef, useCallback } from 'react'
import { useMemoizedFn } from 'ahooks'

export type FileUploadProps = {
  children: React.ReactNode
  accept?: string
  multiple?: boolean
  disabled?: boolean
  onFilesAdded?: (files: File[]) => void
}

export const FileUpload = ({
  children,
  accept,
  disabled,
  multiple,
  onFilesAdded,
}: FileUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useMemoizedFn((files: FileList) => {
    const newFiles = Array.from(files)
    if (multiple) {
      onFilesAdded?.(newFiles)
    } else {
      onFilesAdded?.(newFiles.slice(0, 1))
    }
  })

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files

      if (files) {
        handleFiles(files)
        event.target.value = ''
      }
    },
    [handleFiles]
  )

  return (
    <>
      <input
        type='file'
        ref={inputRef}
        onChange={handleFileSelect}
        className='hidden'
        multiple={multiple}
        accept={accept}
        aria-hidden
        disabled={disabled}
      />
      {children}
    </>
  )
}
