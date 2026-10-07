import axios from 'axios'

import apiClient from './client'
import type { User } from '../types/user'

export interface RegistrationCredentials {
  email: string
  password: string
}

export interface SignInCredentials {
  email: string
  password: string
}

export async function register(
  credentials: RegistrationCredentials,
): Promise<User> {
  const response = await apiClient.post<User>('/auth/register', credentials)
  return response.data
}

export async function signIn(
  credentials: SignInCredentials,
): Promise<void> {
  const formData = new URLSearchParams({
    username: credentials.email,
    password: credentials.password,
  })

  await apiClient.post('/auth/jwt/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
}

export async function signOut(): Promise<void> {
  await apiClient.post('/auth/jwt/logout')
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await apiClient.get<User>('/users/me')
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return null
    }

    throw error
  }
}
