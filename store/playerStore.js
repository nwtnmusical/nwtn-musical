import { create } from 'zustand';

export const usePlayerStore = create((set) => ({
  currentSong: null,
  playlist: [],
  isPlaying: false,
  volume: 0.7,
  progress: 0,

  setCurrentSong: (song) => set({ currentSong: song, isPlaying: true }),
  setPlaylist: (songs) => set({ playlist: songs }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setVolume: (volume) => set({ volume }),
  setProgress: (progress) => set({ progress }),
  nextSong: () => set((state) => {
    if (state.playlist.length === 0) return state;
    const currentIndex = state.playlist.findIndex(s => s.id === state.currentSong?.id);
    const nextIndex = (currentIndex + 1) % state.playlist.length;
    return { currentSong: state.playlist[nextIndex] };
  }),
  previousSong: () => set((state) => {
    if (state.playlist.length === 0) return state;
    const currentIndex = state.playlist.findIndex(s => s.id === state.currentSong?.id);
    const prevIndex = currentIndex === 0 ? state.playlist.length - 1 : currentIndex - 1;
    return { currentSong: state.playlist[prevIndex] };
  }),
}));
