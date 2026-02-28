import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import SongCard from '../components/SongCard';
import VideoCard from '../components/VideoCard';
import AudioPlayer from '../components/AudioPlayer';
import ReviewModal from '../components/ReviewModal';
import { usePlayerStore } from '../store/playerStore';
import { FaMusic, FaVideo, FaStar, FaPlay, FaHeart } from 'react-icons/fa';

export default function Home() {
  const [songs, setSongs] = useState([]);
  const [videos, setVideos] = useState([]);
  const [featuredSongs, setFeaturedSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('songs');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const { currentSong, setCurrentSong, setPlaylist } = usePlayerStore();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      // Fetch latest songs
      const songsQuery = query(
        collection(db, 'songs'), 
        orderBy('createdAt', 'desc'), 
        limit(20)
      );
      const songsSnapshot = await getDocs(songsQuery);
      const songsData = songsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setSongs(songsData);
      setPlaylist(songsData);

      // Fetch featured songs (most played)
      const featuredQuery = query(
        collection(db, 'songs'), 
        orderBy('plays', 'desc'), 
        limit(6)
      );
      const featuredSnapshot = await getDocs(featuredQuery);
      setFeaturedSongs(featuredSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })));

      // Fetch videos
      const videosQuery = query(
        collection(db, 'videos'), 
        orderBy('createdAt', 'desc'), 
        limit(12)
      );
      const videosSnapshot = await getDocs(videosQuery);
      setVideos(videosSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })));

    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>NWTN MUSICAL - Listen to Best Music</title>
        <meta name="description" content="NWTN MUSICAL - Your destination for amazing music" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-primary to-primary-dark">
        <Navbar />
        
        {/* Hero Section - Responsive */}
        <section className="relative min-h-[60vh] sm:min-h-[70vh] flex items-center justify-center overflow-hidden pt-16">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-dark opacity-90"></div>
          <div className="absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center mix-blend-overlay"></div>
          
          <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 text-white">
              Welcome to <span className="text-primary-light">NWTN MUSICAL</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 text-primary-light px-4">
              Discover the best music collection
            </p>
            <button 
              onClick={() => setShowReviewModal(true)}
              className="bg-white text-primary px-6 sm:px-8 py-3 sm:py-4 rounded-full hover:bg-primary-light transition-all transform hover:scale-105 font-semibold flex items-center gap-2 mx-auto text-sm sm:text-base"
            >
              <FaStar />
              Rate Our Music
            </button>
          </div>
        </section>

        {/* Featured Songs - Responsive Grid */}
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 flex items-center gap-2 text-white">
              <FaMusic className="text-primary-light" />
              Featured Songs
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {featuredSongs.slice(0, 4).map((song) => (
                <SongCard 
                  key={song.id} 
                  song={song} 
                  onPlay={() => setCurrentSong(song)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Tabs Section - Responsive */}
        <section className="py-12 sm:py-16 bg-black/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Tab Buttons - Responsive */}
            <div className="flex flex-wrap gap-2 sm:gap-4 mb-6 sm:mb-8">
              <button
                onClick={() => setActiveTab('songs')}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition text-sm sm:text-base ${
                  activeTab === 'songs' 
                    ? 'bg-primary text-white' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Latest Songs
              </button>
              <button
                onClick={() => setActiveTab('videos')}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition text-sm sm:text-base ${
                  activeTab === 'videos' 
                    ? 'bg-primary text-white' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Latest Videos
              </button>
            </div>

            {/* Tab Content - Responsive Grid */}
            {activeTab === 'songs' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {songs.map((song) => (
                  <SongCard 
                    key={song.id} 
                    song={song} 
                    onPlay={() => setCurrentSong(song)}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {videos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Mobile Quick Actions - Sticky for mobile */}
        <div className="fixed bottom-20 right-4 z-40 sm:hidden">
          <button
            onClick={() => setShowReviewModal(true)}
            className="bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary-dark transition"
          >
            <FaStar size={24} />
          </button>
        </div>

        {/* Review Modal */}
        <ReviewModal 
          isOpen={showReviewModal} 
          onClose={() => setShowReviewModal(false)} 
        />

        {/* Audio Player */}
        {currentSong && <AudioPlayer />}
      </div>
    </>
  );
}
