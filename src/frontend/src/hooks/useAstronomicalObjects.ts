import { useQuery } from '@tanstack/react-query'

import apiClient from '../api/client'
import type {
  AstronomicalObject,
  ObjectType,
} from '../types/astronomicalObject'

export interface AstronomicalObjectsParams {
  search?: string
  objectTypeId?: number
  skip?: number
  limit?: number
}

export interface AstronomicalObjectsPage {
  objects: AstronomicalObject[]
  hasNextPage: boolean
}

interface NormalizedAstronomicalObjectsParams {
  search: string | undefined
  objectTypeId: number | undefined
  skip: number
  limit: number
}

export const ASTRONOMICAL_OBJECTS_PAGE_SIZE = 100

const astronomicalObjectsQueryKey = ['astronomical-objects', 'list'] as const
const objectTypesQueryKey = ['object-types'] as const

async function fetchAstronomicalObjects(
  params: NormalizedAstronomicalObjectsParams,
): Promise<AstronomicalObjectsPage> {
  const apiParams = {
    ...(params.search ? { search: params.search } : {}),
    ...(params.objectTypeId !== undefined
      ? { object_type_id: params.objectTypeId }
      : {}),
    skip: params.skip,
    limit: params.limit,
  }
  const response = await apiClient.get<AstronomicalObject[]>(
    '/astronomical-objects',
    { params: apiParams },
  )

  let hasNextPage = false
  if (response.data.length === params.limit) {
    const nextPage = await apiClient.get<AstronomicalObject[]>(
      '/astronomical-objects',
      {
        params: {
          ...apiParams,
          skip: params.skip + response.data.length,
          limit: 1,
        },
      },
    )
    hasNextPage = nextPage.data.length > 0
  }

  return { objects: response.data, hasNextPage }
}

async function fetchObjectTypes(): Promise<ObjectType[]> {
  const response = await apiClient.get<ObjectType[]>('/object-types')
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

export function useAstronomicalObjects(params: AstronomicalObjectsParams = {}) {
  const normalizedParams: NormalizedAstronomicalObjectsParams = {
    search: params.search?.trim() || undefined,
    objectTypeId: params.objectTypeId,
    skip: params.skip ?? 0,
    limit: params.limit ?? ASTRONOMICAL_OBJECTS_PAGE_SIZE,
  }

  return useQuery({
    queryKey: [...astronomicalObjectsQueryKey, normalizedParams],
    queryFn: () => fetchAstronomicalObjects(normalizedParams),
    placeholderData: (previousData) => previousData,
  })
}

export function useObjectTypes() {
  return useQuery({
    queryKey: objectTypesQueryKey,
    queryFn: fetchObjectTypes,
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