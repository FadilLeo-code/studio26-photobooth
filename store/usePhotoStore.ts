import { create } from 'zustand';

interface PhotoStore {
  photos: string[];
  addPhoto: (photo: string) => void;
  clearPhotos: () => void;
}

export const usePhotoStore = create<PhotoStore>((set) => ({
  photos: [],
  addPhoto: (photo) => set((state) => ({ photos: [...state.photos, photo] })),
  clearPhotos: () => set({ photos: [] }),
}));