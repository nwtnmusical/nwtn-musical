import { useState, useEffect } from 'react';
import Head from 'next/head';
import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import SongCard from '../components/SongCard';
import AudioPlayer from '../components/AudioPlayer';
import { usePlayerStore } from '../store/playerStore';
import { FaSearch } from 'react-icons/fa';

export default function SongsPage() {
  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { currentSong, setCurrentSong, setPlaylist } = usePlayerStore();

  useEffect(() => {
    fetchSongs();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = songs.filter(song => 
        song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSongs(filtered);
    } else {
      setFilteredSongs(songs);
    }
  }, [searchTerm, songs]);

  const fetchSongs = async () => {
    try {
      const songsQuery = query(collection(db, 'songs'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(songsQuery);
      const songsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSongs(songsData);
      setFilteredSongs(songsData);
      setPlaylist(songsData);
    } catch (error) {
      console.error('Error fetching songs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>NWTN MUSICAL - All Songs</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-primary to-primary-dark">
        <Navbar />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">All Songs</h1>
            
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search songs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-primary-light rounded-lg text-white placeholder-primary-light focus:outline-none focus:border-white"
              />
            </div>
          </div>

          {/* Songs Grid */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="loading-spinner w-12 h-12"></div>
            </div>
          ) : (
            <>
              {filteredSongs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {filteredSongs.map((song) => (
                    <SongCard 
                      key={song.id} 
                      song={song} 
                      onPlay={() => setCurrentSong(song)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-white/60 text-lg">No songs found</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Audio Player */}
        {currentSong && <AudioPlayer />}
      </div>
    </>
  );
}
