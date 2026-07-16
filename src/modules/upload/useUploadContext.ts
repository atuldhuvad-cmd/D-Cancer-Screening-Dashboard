import { useContext } from 'react'
import type { UploadContextValue } from '../../types/upload'
import { UploadContext } from './UploadContextValue'

export const useUploadContext = (): UploadContextValue => {
  const context = useContext(UploadContext)

  if (!context) {
    throw new Error('useUploadContext must be used within an UploadProvider')
  }

  return context
}
