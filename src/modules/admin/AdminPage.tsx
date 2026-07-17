import '../../styles/admin.css'
import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { loadAdminConfiguration, saveAdminConfiguration, loadConfigurationBackups, saveConfigurationBackup, exportConfigurationToJson, importConfigurationFromFile, createConfigurationBackup, downloadConfigurationBackup } from '../../services/configurationService'
import KpiCard from '../executive/components/KpiCard'
import SmallBarChart from '../executive/components/SmallBarChart'
import type { AdminConfiguration, ConfigurationBackup } from '../../types/configuration'

type ConfigArrayItem<K extends keyof AdminConfiguration> = AdminConfiguration[K] extends Array<infer Item> ? Item & { id: string } : never

const defaultConfig: AdminConfiguration = {
  districts: [],
  blocks: [],
  facilities: [],
  designations: [],
  trainingCategories: [],
}

function AdminPage() {
  const [configuration, setConfiguration] = useState<AdminConfiguration>(defaultConfig)
  const [backups, setBackups] = useState<ConfigurationBackup[]>([])
  const [selectedBackupId, setSelectedBackupId] = useState<string | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  useEffect(() => {
    setConfiguration(loadAdminConfiguration())
    setBackups(loadConfigurationBackups())
  }, [])

  const saveConfig = (next: AdminConfiguration) => {
    setConfiguration(next)
    saveAdminConfiguration(next)
  }

  const addItem = <K extends keyof AdminConfiguration>(key: K, item: ConfigArrayItem<K>): void => {
    const items = configuration[key] as unknown as ConfigArrayItem<K>[]
    saveConfig({ ...configuration, [key]: [...items, item] } as AdminConfiguration)
  }

  const removeItem = <K extends keyof AdminConfiguration>(key: K, id: string): void => {
    const items = configuration[key] as unknown as ConfigArrayItem<K>[]
    saveConfig({ ...configuration, [key]: items.filter((entry) => entry.id !== id) } as AdminConfiguration)
  }

  const updateItem = <K extends keyof AdminConfiguration>(key: K, id: string, updater: (item: ConfigArrayItem<K>) => ConfigArrayItem<K>): void => {
    const items = configuration[key] as unknown as ConfigArrayItem<K>[]
    saveConfig({
      ...configuration,
      [key]: items.map((item) => (item.id === id ? updater(item) : item)),
    } as AdminConfiguration)
  }

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const imported = await importConfigurationFromFile(file)
      saveConfig(imported)
      setImportError(null)
    } catch (error) {
      setImportError('Invalid configuration file. Please upload a valid JSON export.')
    }
  }

  const handleBackup = () => {
    const backup = createConfigurationBackup(configuration, `Admin backup ${new Date().toLocaleString()}`)
    saveConfigurationBackup(backup)
    setBackups((current) => [backup, ...current])
    downloadConfigurationBackup(backup)
  }

  const handleRestoreBackup = () => {
    if (!selectedBackupId) return
    const backup = backups.find((entry) => entry.id === selectedBackupId)
    if (backup) {
      saveConfig(backup.configuration)
    }
  }

  const chartItems = useMemo(
    () => [
      { name: 'Districts', value: configuration.districts.length },
      { name: 'Blocks', value: configuration.blocks.length },
      { name: 'Facilities', value: configuration.facilities.length },
      { name: 'Designations', value: configuration.designations.length },
      { name: 'Training', value: configuration.trainingCategories.length },
    ],
    [configuration],
  )

  return (
    <section className="admin-page page">
      <div className="page-intro">
        <p className="eyebrow">Administration</p>
        <h2>Configuration Management</h2>
        <p>Manage district, block, facility, designation and training category configuration without modifying uploaded workbook data.</p>
      </div>

      <div className="admin-summary-grid">
        <KpiCard title="Districts" value={String(configuration.districts.length)} />
        <KpiCard title="Blocks" value={String(configuration.blocks.length)} />
        <KpiCard title="Facilities" value={String(configuration.facilities.length)} />
        <KpiCard title="Designations" value={String(configuration.designations.length)} />
        <KpiCard title="Training Categories" value={String(configuration.trainingCategories.length)} />
      </div>

      <div className="admin-chart-panel panel">
        <SmallBarChart title="Configuration Counts" items={chartItems} />
      </div>

      <div className="admin-operations panel">
        <button type="button" className="upload-button" onClick={() => exportConfigurationToJson(configuration)}>
          Export Configuration
        </button>
        <label className="file-upload-button">
          Import Configuration
          <input type="file" accept="application/json" onChange={handleImport} />
        </label>
        <button type="button" className="upload-button" onClick={handleBackup}>
          Backup Configuration
        </button>
      </div>

      {importError ? <div className="admin-error">{importError}</div> : null}

      <div className="admin-config-sections">
        <div className="admin-config-card panel">
          <h3>District Configuration</h3>
          <button type="button" className="secondary-button" onClick={() => addItem('districts', { id: `${Date.now()}-district`, name: 'New District', code: '', description: '' })}>
            Add District
          </button>
          <div className="config-list">
            {configuration.districts.map((district) => (
              <div className="config-item" key={district.id}>
                <input
                  value={district.name}
                  onChange={(event) => updateItem('districts', district.id, (item) => ({ ...item, name: event.target.value }))}
                  placeholder="District name"
                />
                <button type="button" className="remove-button" onClick={() => removeItem('districts', district.id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-config-card panel">
          <h3>Block Configuration</h3>
          <button type="button" className="secondary-button" onClick={() => addItem('blocks', { id: `${Date.now()}-block`, districtId: configuration.districts[0]?.id ?? '', name: 'New Block', code: '', description: '' })}>
            Add Block
          </button>
          <div className="config-list">
            {configuration.blocks.map((block) => (
              <div className="config-item" key={block.id}>
                <input
                  value={block.name}
                  onChange={(event) => updateItem('blocks', block.id, (item) => ({ ...item, name: event.target.value }))}
                  placeholder="Block name"
                />
                <button type="button" className="remove-button" onClick={() => removeItem('blocks', block.id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-config-card panel">
          <h3>Facility Configuration</h3>
          <button type="button" className="secondary-button" onClick={() => addItem('facilities', { id: `${Date.now()}-facility`, blockId: configuration.blocks[0]?.id ?? '', name: 'New Facility', code: '', description: '' })}>
            Add Facility
          </button>
          <div className="config-list">
            {configuration.facilities.map((facility) => (
              <div className="config-item" key={facility.id}>
                <input
                  value={facility.name}
                  onChange={(event) => updateItem('facilities', facility.id, (item) => ({ ...item, name: event.target.value }))}
                  placeholder="Facility name"
                />
                <button type="button" className="remove-button" onClick={() => removeItem('facilities', facility.id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-config-card panel">
          <h3>Designation Configuration</h3>
          <button type="button" className="secondary-button" onClick={() => addItem('designations', { id: `${Date.now()}-designation`, name: 'New Designation', code: '', description: '' })}>
            Add Designation
          </button>
          <div className="config-list">
            {configuration.designations.map((designation) => (
              <div className="config-item" key={designation.id}>
                <input
                  value={designation.name}
                  onChange={(event) => updateItem('designations', designation.id, (item) => ({ ...item, name: event.target.value }))}
                  placeholder="Designation name"
                />
                <button type="button" className="remove-button" onClick={() => removeItem('designations', designation.id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-config-card panel">
          <h3>Training Category Configuration</h3>
          <button type="button" className="secondary-button" onClick={() => addItem('trainingCategories', { id: `${Date.now()}-training`, name: 'New Training Category', description: '' })}>
            Add Category
          </button>
          <div className="config-list">
            {configuration.trainingCategories.map((training) => (
              <div className="config-item" key={training.id}>
                <input
                  value={training.name}
                  onChange={(event) => updateItem('trainingCategories', training.id, (item) => ({ ...item, name: event.target.value }))}
                  placeholder="Training category"
                />
                <button type="button" className="remove-button" onClick={() => removeItem('trainingCategories', training.id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="backup-panel panel">
        <h3>Configuration Backups</h3>
        <div className="backup-controls">
          <select value={selectedBackupId ?? ''} onChange={(event) => setSelectedBackupId(event.target.value || null)}>
            <option value="">Select backup</option>
            {backups.map((backup) => (
              <option value={backup.id} key={backup.id}>{backup.label}</option>
            ))}
          </select>
          <button type="button" className="upload-button" onClick={handleRestoreBackup} disabled={!selectedBackupId}>
            Restore Backup
          </button>
        </div>
      </div>
    </section>
  )
}

export default AdminPage
