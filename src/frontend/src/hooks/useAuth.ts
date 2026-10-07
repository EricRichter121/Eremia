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
    onSuccess: () => {
      queryClient.setQueryData(currentUserQueryKey, null)
    },
  })
}
