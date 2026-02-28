import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { FaPlay, FaMusic, FaVideo, FaStar } from 'react-icons/fa';
import ReviewModal from '../components/ReviewModal';
import toast from 'react-hot-toast';

export default function Home() {
  const [songs, setSongs] = useState([]);
  const [videos, setVideos] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [activeTab, setActiveTab] = useState('songs');

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    // Fetch songs
    const songsQuery = query(collection(db, 'songs'), orderBy('createdAt', 'desc'));
    const songsSnapshot = await getDocs(songsQuery);
    setSongs(songsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    // Fetch videos
    const videosQuery = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));
    const videosSnapshot = await getDocs(videosQuery);
    setVideos(videosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handlePlay = (song) => {
    setCurrentSong(song);
    // Track play
    trackAnalytics('song_play', song.id);
  };

  const trackAnalytics = async (type, itemId) => {
    // Implement analytics tracking
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#d12200] to-[#a51502]">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg fixed w-full z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src="/logo.png" alt="NWTN MUSICAL" className="h-12 w-auto" />
              <h1 className="text-2xl font-bold text-white">NWTN MUSICAL</h1>
            </div>
            <nav className="flex space-x-6">
              <button 
                onClick={() => setActiveTab('songs')}
                className={`text-white ${activeTab === 'songs' ? 'border-b-2 border-white' : ''}`}
              >
                Songs
              </button>
              <button 
                onClick={() => setActiveTab('videos')}
                className={`text-white ${activeTab === 'videos' ? 'border-b-2 border-white' : ''}`}
              >
                Videos
              </button>
              <button 
                onClick={() => setShowReviewModal(true)}
                className="bg-white text-[#d12200] px-4 py-2 rounded-full hover:bg-[#f8c5c0] transition"
              >
                Review Us
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24 pb-32">
        {activeTab === 'songs' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {songs.map((song) => (
              <div key={song.id} className="bg-white/10 backdrop-blur-lg rounded-lg overflow-hidden hover:transform hover:scale-105 transition">
                <img 
                  src={song.thumbnail || '/default-song.jpg'} 
                  alt={song.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-white font-bold text-lg">{song.title}</h3>
                  <p className="text-[#f8c5c0] text-sm">{song.artist}</p>
                  <div className="flex items-center mt-2">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className={i < song.rating ? 'text-yellow-400' : 'text-gray-400'} />
                    ))}
                  </div>
                  <button 
                    onClick={() => handlePlay(song)}
                    className="mt-4 w-full bg-white text-[#d12200] py-2 rounded-full flex items-center justify-center space-x-2 hover:bg-[#f8c5c0] transition"
                  >
                    <FaPlay size={12} />
                    <span>Play Now</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div key={video.id} className="bg-white/10 backdrop-blur-lg rounded-lg overflow-hidden">
                <a 
                  href={`https://youtube.com/watch?v=${video.youtubeId}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block relative"
                >
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                    <FaPlay className="text-white text-4xl" />
                  </div>
                </a>
                <div className="p-4">
                  <h3 className="text-white font-bold">{video.title}</h3>
                  <p className="text-[#f8c5c0] text-sm mt-1">{video.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Audio Player */}
      {currentSong && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#a51502] border-t border-[#f8c5c0]">
          <AudioPlayer
            autoPlay
            src={currentSong.audioUrl}
            onPlay={() => trackAnalytics('song_play', currentSong.id)}
            header={`Now Playing: ${currentSong.title}`}
            className="custom-player"
            showDownloadProgress={false}
            showFilledProgress={true}
            showJumpControls={true}
            layout="horizontal"
            customProgressBarSection={[]}
            customControlsSection={['MAIN_CONTROLS', 'VOLUME_CONTROLS']}
            autoPlayAfterSrcChange={false}
          />
        </div>
      )}

      {/* Review Modal */}
      <ReviewModal 
        isOpen={showReviewModal} 
        onClose={() => setShowReviewModal(false)}
        onSubmit={trackAnalytics}
      />
    </div>
  );
}
