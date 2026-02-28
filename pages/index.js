import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import Navbar from '@/components/Navbar';
import SongCard from '@/components/SongCard';
import VideoCard from '@/components/VideoCard';
import AudioPlayer from '@/components/AudioPlayer';
import ReviewModal from '@/components/ReviewModal';
import { usePlayerStore } from '@/store/playerStore';
import { FaMusic, FaVideo, FaStar } from 'react-icons/fa';

export default function Home() {
  const [songs, setSongs] = useState([]);
  const [videos, setVideos] = useState([]);
  const [featuredSongs, setFeaturedSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('songs');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const { currentSong, setCurrentSong } = usePlayerStore();

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
        <title>NWTN MUSICAL - Home</title>
        <meta name="description" content="Listen to the best music on NWTN MUSICAL" />
      </Head>

      <div className="min-h-screen">
        <Navbar />
        
        {/* Hero Section */}
        <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-dark opacity-90"></div>
          <div className="absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center mix-blend-overlay"></div>
          
          <div className="relative container-custom text-center z-10">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
              Welcome to <span className="text-primary-light">NWTN MUSICAL</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-light">
              Discover the best music collection
            </p>
            <button 
              onClick={() => setShowReviewModal(true)}
              className="btn-secondary flex items-center gap-2 mx-auto"
            >
              <FaStar />
              Rate Our Music
            </button>
          </div>
        </section>

        {/* Featured Songs */}
        <section className="py-16">
          <div className="container-custom">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
              <FaMusic className="text-primary-light" />
              Featured Songs
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredSongs.map((song) => (
                <SongCard 
                  key={song.id} 
                  song={song} 
                  onPlay={() => setCurrentSong(song)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Tabs Section */}
        <section className="py-16 bg-black/20">
          <div className="container-custom">
            {/* Tab Buttons */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => setActiveTab('songs')}
                className={`px-6 py-3 rounded-lg font-semibold transition ${
                  activeTab === 'songs' 
                    ? 'bg-primary text-white' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Latest Songs
              </button>
              <button
                onClick={() => setActiveTab('videos')}
                className={`px-6 py-3 rounded-lg font-semibold transition ${
                  activeTab === 'videos' 
                    ? 'bg-primary text-white' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Latest Videos
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'songs' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {songs.map((song) => (
                  <SongCard 
                    key={song.id} 
                    song={song} 
                    onPlay={() => setCurrentSong(song)}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            )}
          </div>
        </section>

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
