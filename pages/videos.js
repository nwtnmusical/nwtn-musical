import { useState, useEffect } from 'react';
import Head from 'next/head';
import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import VideoCard from '../components/VideoCard';
import { FaSearch } from 'react-icons/fa';

export default function VideosPage() {
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = videos.filter(video => 
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredVideos(filtered);
    } else {
      setFilteredVideos(videos);
    }
  }, [searchTerm, videos]);

  const fetchVideos = async () => {
    try {
      const videosQuery = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(videosQuery);
      const videosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVideos(videosData);
      setFilteredVideos(videosData);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>NWTN MUSICAL - All Videos</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-primary to-primary-dark">
        <Navbar />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">All Videos</h1>
            
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-primary-light rounded-lg text-white placeholder-primary-light focus:outline-none focus:border-white"
              />
            </div>
          </div>

          {/* Videos Grid */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="loading-spinner w-12 h-12"></div>
            </div>
          ) : (
            <>
              {filteredVideos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredVideos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-white/60 text-lg">No videos found</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
