import { create } from 'zustand'
import type { Profile } from '../../../domain/budget/ports/profilesRepository'
import { profilesRepository } from '../../../infrastructure/storage/profilesRepository'

type ProfileState = {
  profile: Profile | null
  loading: boolean
  error: string | null
  fetchProfile: () => Promise<void>
  completeOnboarding: () => Promise<void>
  reset: () => void
}

export const useProfileStore = create<ProfileState>()((set) => ({
  profile: null,
  loading: true,
  error: null,

  async fetchProfile() {
    set({ loading: true, error: null })
    try {
      const profile = await profilesRepository.get()
      set({ profile, loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  async completeOnboarding() {
    await profilesRepository.update({ onboardingCompleted: true })
    set((s) => ({
      profile: s.profile ? { ...s.profile, onboardingCompleted: true } : s.profile,
    }))
  },

  reset() {
    set({ profile: null, loading: true, error: null })
  },
}))
