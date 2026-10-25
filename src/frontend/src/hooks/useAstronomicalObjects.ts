import { useQuery } from '@tanstack/react-query'

import apiClient from '../api/client'
import type { AstronomicalObject } from '../types/astronomicalObject'

async function fetchAstronomicalObjects(): Promise<AstronomicalObject[]> {
  const response = await apiClient.get<AstronomicalObject[]>(
    '/astronomical-objects',
  )

  return response.data
}

async function fetchAstronomicalObject(
  objectId: number,
): Promise<AstronomicalObject> {
  const response = await apiClient.get<AstronomicalObject>(
    `/astronomical-objects/${objectId}`,
  )

  return response.data
}

export function useAstronomicalObjects() {
  return useQuery({
    queryKey: ['astronomical-objects'],
    queryFn: fetchAstronomicalObjects,
  })
}

export function useAstronomicalObject(objectId: number | undefined) {
  return useQuery({
    queryKey: ['astronomical-objects', objectId],
    queryFn: () => {
      if (objectId === undefined) {
        throw new Error('A valid astronomical object ID is required.')
      }

      return fetchAstronomicalObject(objectId)
    },
    enabled: objectId !== undefined,
  })
}