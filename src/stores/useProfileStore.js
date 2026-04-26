import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useProfileStore = create(
  persist(
    (set) => ({
      displayName: 'Khách',
      bio: 'Học hỏi không ngừng, tư duy không giới hạn.',
      school: 'Trường THPT',
      role: 'HỌC SINH',
      
      updateProfile: (newProfile) => set((state) => ({
        ...state,
        ...newProfile
      })),
      
      resetProfile: () => set({
        displayName: 'Khách',
        bio: 'Học hỏi không ngừng, tư duy không giới hạn.',
        school: 'Trường THPT',
        role: 'HỌC SINH',
      })
    }),
    {
      name: 'spatialmind_profile_storage', // Tên key trong localStorage
    }
  )
);
