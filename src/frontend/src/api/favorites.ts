import apiClient from './client'
import type { AstronomicalObject } from '../types/astronomicalObject'

export interface Favorite {
  id: number
  created_at: string
  astronomical_object: AstronomicalObject
}

export interface CreateFavoritePayload {
  astronomical_object_id: number
}

export async function getFavorites(): Promise<Favorite[]> {
  const response = await apiClient.get<Favorite[]>('/favorites')
  return response.data
}

export async function createFavorite(
  payload: CreateFavoritePayload,
): Promise<Favorite> {
  const response = await apiClient.post<Favorite>('/favorites', payload)
  return response.data
}

export async function deleteFavorite(objectId: number): Promise<void> {
  await apiClient.delete(`/favorites/${objectId}`)
}
