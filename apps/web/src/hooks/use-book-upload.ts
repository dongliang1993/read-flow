import { useState, useCallback } from 'react'
import { useMemoizedFn } from 'ahooks'
import { toast } from 'sonner'

import { useLibraryStore } from '@/store/library-store'
import { booksApi as bookService, getFileExtension } from '@/service/books'
import { FILE_ACCEPT_FORMATS, SUPPORTED_FILE_EXTS } from '@/constants/upload'

const FILE_ACCEPT_MAP = new Map<string, string>()

SUPPORTED_FILE_EXTS.forEach((ext) => {
  FILE_ACCEPT_MAP.set(ext, `.${ext}`)
})

type UseBookUploadConfig = {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export const useBookUpload = (config: UseBookUploadConfig = {}) => {
  const { onSuccess, onError } = config
  const [isUploading, setIsUploading] = useState(false)
  const addBook = useLibraryStore((state) => state.addBook)

  const uploadBooks = useMemoizedFn(async (files: File[]) => {
    try {
      setIsUploading(true)
      for (const file of files) {
        try {
          const response = await bookService.uploadBook(file)
          const book = response.book
          addBook(book)
        } catch (error) {
          console.error('Upload failed:', error)
          toast.error('上传失败!')
        }
      }

      onSuccess?.()
    } catch (error) {
      console.error('Upload failed:', error)
      toast.error('上传失败!')
      onError?.(error as Error)
    } finally {
      setIsUploading(false)
    }
  })

  const handleProcessFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) {
        return
      }

      const supportedFiles = files.filter((file) => {
        const fileExt = getFileExtension(file.name)
        return fileExt && FILE_ACCEPT_MAP.has(fileExt)
      })

      if (supportedFiles.length === 0) {
        toast.warning('未找到支持的文件!')
        return
      }

      await uploadBooks(supportedFiles)
    },
    [uploadBooks]
  )

  const selectFiles = useCallback((): Promise<FileList | null> => {
    return new Promise((resolve) => {
      const fileInput = document.createElement('input')
      fileInput.type = 'file'
      fileInput.accept = FILE_ACCEPT_FORMATS
      fileInput.multiple = true
      fileInput.click()

      fileInput.onchange = () => {
        resolve(fileInput.files)
      }
    })
  }, [])

  const triggerFileSelect = useMemoizedFn(async () => {
    const files = await selectFiles()

    if (files) {
      handleProcessFiles(Array.from(files))
    }
  })

  return { isUploading, triggerFileSelect }
}
