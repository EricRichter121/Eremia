import { skipToken, useQuery } from '@tanstack/react-query'

import apiClient from '../api/client'
import type { AstronomicalObject } from '../types/astronomicalObject'

async function fetchAstronomicalObjects(): Promise<AstronomicalObject[]> {
  const response = await apiClient.get<AstronomicalObject[]>(
    '/astronomical-objects',
  )

  return response.data
}

export function useAstronomicalObjects() {
  return useQuery({
    queryKey: ['astronomical-objects'],
    queryFn: fetchAstronomicalObjects,
  })
}

async function fetchAstronomicalObject(
  objectId: number,
): Promise<AstronomicalObject> {
  const response = await apiClient.get<AstronomicalObject>(
    `/astronomical-objects/${objectId}`,
  )

  return response.data
}

export function useAstronomicalObject(objectId: number | undefined) {
  return useQuery({
    queryKey: ['astronomical-objects', objectId],
    queryFn:
      objectId === undefined
        ? skipToken
        : () => fetchAstronomicalObject(objectId),
  })
}