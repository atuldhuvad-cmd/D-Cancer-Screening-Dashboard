export interface DesignationAlias {
  alias: string
  canonical: string
}

export interface DesignationMapping {
  canonical: string
  aliases: string[]
}
