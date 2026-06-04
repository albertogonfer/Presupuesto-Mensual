import { supabase } from '../../lib/supabase'
import type { Profile, ProfilesRepository } from '../../domain/budget/ports/profilesRepository'

type ProfileRow = {
  id: string
  full_name: string
  onboarding_completed: boolean
  created_at: string
}

function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    fullName: row.full_name,
    onboardingCompleted: row.onboarding_completed,
    createdAt: row.created_at,
  }
}

async function requireUser(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Not authenticated')
  return session.user.id
}

export const profilesRepository: ProfilesRepository = {
  async get(): Promise<Profile> {
    const userId = await requireUser()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) throw new Error('Failed to fetch profile')
    return toProfile(data)
  },

  async update(patch): Promise<void> {
    const userId = await requireUser()
    const row: Partial<ProfileRow> = {}
    if (patch.fullName !== undefined) row.full_name = patch.fullName
    if (patch.onboardingCompleted !== undefined) row.onboarding_completed = patch.onboardingCompleted
    const { error } = await supabase
      .from('profiles')
      .update(row)
      .eq('id', userId)
    if (error) throw new Error('Failed to update profile')
  },
}
