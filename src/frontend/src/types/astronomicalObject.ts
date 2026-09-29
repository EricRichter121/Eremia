export interface ObjectType {
  id: number
  name: string
  description: string | null
}

export interface AstronomicalObject {
  id: number
  name: string
  catalog_id: string | null
  object_type_id: number
  description: string | null
  discovered_at: string | null
  object_type: ObjectType
}