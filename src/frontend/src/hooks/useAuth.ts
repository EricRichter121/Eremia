import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  getCurrentUser,
  register,
  signIn,
  signOut,
  type RegistrationCredentials,
  type SignInCredentials,
} from '../api/auth'

export const currentUserQueryKey = ['current-user'] as const

export function useCurrentUser() {
  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: getCurrentUser,
  })
}

export function useSignIn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (credentials: SignInCredentials) => signIn(credentials),
    // Refresh the cached user after the login cookie has been established.
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: currentUserQueryKey }),
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: (credentials: RegistrationCredentials) => register(credentials),
  })
}

export function useSignOut() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: signOut,
    // Avoid showing the previously cached user after the session ends.
    onSuccess: () => {
      queryClient.setQueryData(currentUserQueryKey, null)
    },
  })
}
