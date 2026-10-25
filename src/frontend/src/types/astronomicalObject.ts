export interface ObjectType {
  id: number
  name: string
  description: string | null
}

export interface PlanetaryParameters {
  mass_earth: number | string | null
  radius_earth: number | string | null
  orbital_period_days: number | string | null
  semi_major_axis_au: number | string | null
  eccentricity: number | string | null
  inclination_deg: number | string | null
  equilibrium_temperature_k: number | string | null
  insolation_flux_earth: number | string | null
}

export interface AstronomicalObject {
  id: number
  name: string
  catalog_id: string | null
  object_type_id: number
  description: string | null
  discovered_at: string | null
  object_type: ObjectType
  planetary_parameters: PlanetaryParameters | null
}