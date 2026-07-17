import type { AdminConfiguration, ConfigurationBackup } from '../types/configuration'

const CONFIG_KEY = 'wtip-admin-configuration'
const BACKUP_KEY = 'wtip-admin-configuration-backups'

const defaultConfig: AdminConfiguration = {
  districts: [],
  blocks: [],
  facilities: [],
  designations: [],
  trainingCategories: [],
}

const readJson = <T>(key: string, fallback: T): T => {
  const raw = localStorage.getItem(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

const writeJson = (key: string, data: unknown) => {
  localStorage.setItem(key, JSON.stringify(data))
}

export const loadAdminConfiguration = (): AdminConfiguration => readJson<AdminConfiguration>(CONFIG_KEY, defaultConfig)

export const saveAdminConfiguration = (configuration: AdminConfiguration): void => {
  writeJson(CONFIG_KEY, configuration)
}

export const loadConfigurationBackups = (): ConfigurationBackup[] => readJson<ConfigurationBackup[]>(BACKUP_KEY, [])

export const saveConfigurationBackup = (backup: ConfigurationBackup): void => {
  const backups = loadConfigurationBackups()
  writeJson(BACKUP_KEY, [backup, ...backups])
}

export const clearConfigurationBackups = (): void => {
  localStorage.removeItem(BACKUP_KEY)
}

export const exportConfigurationToJson = (configuration: AdminConfiguration, filename = 'wtip-admin-config.json'): void => {
  const blob = new Blob([JSON.stringify(configuration, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export const importConfigurationFromFile = async (file: File): Promise<AdminConfiguration> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string) as AdminConfiguration
        resolve(parsed)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}

export const createConfigurationBackup = (configuration: AdminConfiguration, label = `Backup ${new Date().toISOString()}`): ConfigurationBackup => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  label,
  createdAt: new Date().toISOString(),
  configuration,
})

export const downloadConfigurationBackup = (backup: ConfigurationBackup): void => {
  const blob = new Blob([JSON.stringify(backup.configuration, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `wtip-admin-config-backup-${backup.id}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
