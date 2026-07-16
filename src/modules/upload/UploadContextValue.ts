import { createContext } from 'react'
import type { UploadContextValue } from '../../types/upload'

export const UploadContext = createContext<UploadContextValue | undefined>(undefined)
