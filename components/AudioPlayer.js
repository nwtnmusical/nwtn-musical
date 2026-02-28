import { useEffect, useRef } from 'react';
import H5AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { usePlayerStore } from '../store/playerStore';
import { db } from '../lib/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';

export default function AudioPlayer() {
  const { currentSong, setCurrentSong, playlist } = usePlayerStore();
  const playerRef = useRef();

  useEffect(() => {
    // Disable right click on audio player
    const disableContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    const audioElement = playerRef.current?.audio?.current;
    if (audioElement) {
      audioElement.addEventListener('contextmenu', disableContextMenu);
      
      // Prevent dragging to download
      audioElement.addEventListener('dragstart', (e) => e.preventDefault());
      
      // Disable developer tools shortcuts (basic protection)
      document.addEventListener('keydown', (e) => {
        if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
          e.preventDefault();
        }
      });
    }

    return () => {
      if (audioElement) {
        audioElement.removeEventListener('contextmenu', disableContextMenu);
      }
    };
  }, [currentSong]);

  const handlePlay = async () => {
    if (currentSong) {
      try {
        const songRef = doc(db, 'songs', currentSong.id);
        await updateDoc(songRef, {
          plays: increment(1)
        });
      } catch (error) {
        console.error('Error updating play count:', error);
      }
    }
  };

  const handleNext = () => {
    if (playlist.length > 0) {
      const currentIndex = playlist.findIndex(song => song.id === currentSong?.id);
      const nextSong = playlist[currentIndex + 1] || playlist[0];
      setCurrentSong(nextSong);
    }
  };

  const handlePrevious = () => {
    if (playlist.length > 0) {
      const currentIndex = playlist.findIndex(song => song.id === currentSong?.id);
      const prevSong = playlist[currentIndex - 1] || playlist[playlist.length - 1];
      setCurrentSong(prevSong);
    }
  };

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <H5AudioPlayer
        ref={playerRef}
        src={currentSong.audioUrl}
        onPlay={handlePlay}
        onEnded={handleNext}
        showSkipControls={playlist.length > 1}
        onClickNext={handleNext}
        onClickPrevious={handlePrevious}
        header={`Now Playing: ${currentSong.title} - ${currentSong.artist}`}
        layout="horizontal"
        className="custom-audio-player"
        customAdditionalControls={[]}
        showDownloadProgress={false}
        showFilledProgress={true}
        showJumpControls={true}
        autoPlayAfterSrcChange={false}
      />
    </div>
  );
}
