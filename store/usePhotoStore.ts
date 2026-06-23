import { create } from "zustand";

interface PhotoStore {
  photos: string[];
  addPhoto: (photo: string) => void;
  updatePhoto: (index: number, photo: string) => void; // PASTIKAN BARIS INI ADA
  clearPhotos: () => void;
}

export const usePhotoStore = create<PhotoStore>((set) => ({
  photos: [],
  addPhoto: (photo) => set((state) => ({ photos: [...state.photos, photo] })),
  
  // PASTIKAN FUNGSI INI DITAMBAHKAN
  updatePhoto: (index, newPhoto) => set((state) => {
    const newPhotos = [...state.photos];
    newPhotos[index] = newPhoto;
    return { photos: newPhotos };
  }),
  
  clearPhotos: () => set({ photos: [] }),
}));