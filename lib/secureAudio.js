// This utility helps prevent direct downloading of audio files

export const secureAudioUrl = (url) => {
  // You can implement token-based authentication here
  // For Firebase Storage, you can use signed URLs with expiration
  
  return url; // In production, implement signed URLs
};

// Add this to your audio player component to disable right-click
export const disableDownload = (e) => {
  e.preventDefault();
  return false;
};

// Implement audio streaming instead of direct download
export const streamAudio = async (audioUrl) => {
  // Fetch audio in chunks and stream
  const response = await fetch(audioUrl);
  const reader = response.body.getReader();
  // Implement streaming logic
};
