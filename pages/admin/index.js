import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, limit, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { FaMusic, FaVideo, FaComments, FaChartBar, FaCog } from 'react-icons/fa';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    songs: 0,
    videos: 0,
    reviews: 0,
    comments: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    // Fetch counts from Firebase
    const songsSnap = await getDocs(collection(db, 'songs'));
    const videosSnap = await getDocs(collection(db, 'videos'));
    const reviewsSnap = await getDocs(collection(db, 'reviews'));
    const commentsSnap = await getDocs(collection(db, 'comments'));

    setStats({
      songs: songsSnap.size,
      videos: videosSnap.size,
      reviews: reviewsSnap.size,
      comments: commentsSnap.size
    });
  };

  const menuItems = [
    { icon: FaMusic, label: 'Songs', href: '/admin/songs', color: 'bg-blue-500' },
    { icon: FaVideo, label: 'Videos', href: '/admin/videos', color: 'bg-green-500' },
    { icon: FaComments, label: 'Comments', href: '/admin/comments', color: 'bg-purple-500' },
    { icon: FaChartBar, label: 'Analytics', href: '/admin/analytics', color: 'bg-yellow-500' },
    { icon: FaCog, label: 'Settings', href: '/admin/settings', color: 'bg-gray-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-[#d12200] text-white p-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-[#f8c5c0]">Welcome back, Admin</p>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Total Songs</p>
                <h3 className="text-3xl font-bold text-[#d12200]">{stats.songs}</h3>
              </div>
              <FaMusic className="text-4xl text-[#f8c5c0]" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Total Videos</p>
                <h3 className="text-3xl font-bold text-[#d12200]">{stats.videos}</h3>
              </div>
              <FaVideo className="text-4xl text-[#f8c5c0]" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Reviews</p>
                <h3 className="text-3xl font-bold text-[#d12200]">{stats.reviews}</h3>
              </div>
              <FaComments className="text-4xl text-[#f8c5c0]" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Comments</p>
                <h3 className="text-3xl font-bold text-[#d12200]">{stats.comments}</h3>
              </div>
              <FaChartBar className="text-4xl text-[#f8c5c0]" />
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {menuItems.map((item, index) => (
            <Link key={index} href={item.href}>
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
                <div className={`${item.color} w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4`}>
                  <item.icon size={24} />
                </div>
                <h3 className="font-semibold text-gray-800">{item.label}</h3>
                <p className="text-sm text-gray-500">Manage {item.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
