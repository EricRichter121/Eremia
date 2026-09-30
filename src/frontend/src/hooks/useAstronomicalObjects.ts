import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

import type { AstronomicalObject } from '../types/astronomicalObject'

async function fetchAstronomicalObjects(): Promise<AstronomicalObject[]> {
  const response = await axios.get<AstronomicalObject[]>(
    `${import.meta.env.VITE_API_URL}/api/astronomical-objects`,
  )

  return response.data
}

export function useAstronomicalObjects() {
  return useQuery({
    queryKey: ['astronomical-objects'],
    queryFn: fetchAstronomicalObjects,
  })
}