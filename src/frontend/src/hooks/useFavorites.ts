import axios from 'axios'
import {
  useIsMutating,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  createFavorite,
  deleteFavorite,
  getFavorites,
} from '../api/favorites'
import { currentUserQueryKey, useCurrentUser } from './useAuth'

export const favoritesQueryKey = ['favorites'] as const
const addFavoriteMutationKey = ['favorites', 'add'] as const
const removeFavoriteMutationKey = ['favorites', 'remove'] as const

function clearSessionFavorites(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.setQueryData(currentUserQueryKey, null)
  queryClient.removeQueries({ queryKey: favoritesQueryKey })
}

export function useFavorites() {
  const {
    data: user,
    isPending: isUserPending,
    isError: isUserError,
    refetch: refetchUser,
  } = useCurrentUser()
  const queryClient = useQueryClient()

  const favoritesQuery = useQuery({
    queryKey: [...favoritesQueryKey, user?.id],
    queryFn: async () => {
      try {
        return await getFavorites()
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          clearSessionFavorites(queryClient)
        }
        throw error
      }
    },
    retry: (failureCount, error) =>
      !(axios.isAxiosError(error) && error.response?.status === 401) &&
      failureCount < 3,
    enabled: Boolean(user),
  })

  return {
    ...favoritesQuery,
    isPending: Boolean(user) && favoritesQuery.isPending,
    user,
    isUserPending,
    isUserError,
    refetchUser,
  }
}

export function useFavoriteMutations() {
  const queryClient = useQueryClient()
  const { data: user } = useCurrentUser()

  const addMutation = useMutation({
    mutationKey: addFavoriteMutationKey,
    mutationFn: createFavorite,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: favoritesQueryKey })
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        clearSessionFavorites(queryClient)
      } else if (
        axios.isAxiosError(error) &&
        (error.response?.status === 404 || error.response?.status === 409)
      ) {
        void queryClient.invalidateQueries({ queryKey: favoritesQueryKey })
      }
    },
  })

  const removeMutation = useMutation({
    mutationKey: removeFavoriteMutationKey,
    mutationFn: deleteFavorite,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: favoritesQueryKey })
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        clearSessionFavorites(queryClient)
      } else if (
        axios.isAxiosError(error) &&
        (error.response?.status === 404 || error.response?.status === 409)
      ) {
        void queryClient.invalidateQueries({ queryKey: favoritesQueryKey })
      }
    },
  })

  const isAddingFavorite = useIsMutating({
    mutationKey: addFavoriteMutationKey,
  }) > 0
  const isRemovingFavorite = useIsMutating({
    mutationKey: removeFavoriteMutationKey,
  }) > 0

  return {
    addFavorite: (objectId: number) => {
      if (user && !isAddingFavorite) {
        addMutation.mutate({ astronomical_object_id: objectId })
      }
    },
    removeFavorite: (objectId: number) => {
      if (user && !isRemovingFavorite) {
        removeMutation.mutate(objectId)
      }
    },
    isPending: isAddingFavorite || isRemovingFavorite,
    error: addMutation.error ?? removeMutation.error,
    resetError: () => {
      addMutation.reset()
      removeMutation.reset()
    },
  }
}

export function getFavoriteErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    switch (error.response?.status) {
      case 401:
        return 'Your session expired. Sign in again to manage favorites.'
      case 404:
        return 'That catalog object or favorite is no longer available.'
      case 409:
        return 'That object is already in your favorites.'
      default:
        return 'Favorites could not be updated. Please try again.'
    }
  }

  return 'Favorites could not be updated. Please try again.'
}
