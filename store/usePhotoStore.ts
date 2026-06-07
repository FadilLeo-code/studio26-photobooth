import { create } from 'zustand';

interface PhotoStore {
  photos: string[];
  addPhoto: (photo: string) => void;
  updatePhoto: (index: number, newPhoto: string) => void; // Fungsi baru untuk Retake
  clearPhotos: () => void;
}

export const usePhotoStore = create<PhotoStore>((set) => ({
  photos: [],
  addPhoto: (photo) => set((state) => ({ photos: [...state.photos, photo] })),
  
  // Logika untuk menimpa foto pada index/urutan tertentu
  updatePhoto: (index, newPhoto) => set((state) => {
    const newPhotos = [...state.photos];
    newPhotos[index] = newPhoto;
    return { photos: newPhotos };
  }),
  
  clearPhotos: () => set({ photos: [] }),
}));