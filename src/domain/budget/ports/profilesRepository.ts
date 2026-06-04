export type Profile = {
  id: string
  fullName: string
  onboardingCompleted: boolean
  createdAt: string
}

export type ProfilesRepository = {
  get: () => Promise<Profile>
  update: (patch: Partial<Pick<Profile, 'fullName' | 'onboardingCompleted'>>) => Promise<void>
}
