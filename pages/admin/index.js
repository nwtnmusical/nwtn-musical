import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { FaMusic, FaVideo, FaComments, FaStar, FaEye, FaChartBar } from 'react-icons/fa';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    songs: 0,
    videos: 0,
    reviews: 0,
    comments: 0,
    totalPlays: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchStats();
      fetchRecentActivity();
    }
  }, [session]);

  const fetchStats = async () => {
    try {
      const songsSnap = await getDocs(collection(db, 'songs'));
      const videosSnap = await getDocs(collection(db, 'videos'));
      const reviewsSnap = await getDocs(collection(db, 'reviews'));
      const commentsSnap = await getDocs(collection(db, 'comments'));

      // Calculate total plays
      let totalPlays = 0;
      songsSnap.forEach(doc => {
        totalPlays += doc.data().plays || 0;
      });

      setStats({
        songs: songsSnap.size,
        videos: videosSnap.size,
        reviews: reviewsSnap.size,
        comments: commentsSnap.size,
        totalPlays
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const reviewsQuery = query(
        collection(db, 'reviews'), 
        orderBy('createdAt', 'desc'), 
        limit(5)
      );
      const reviewsSnap = await getDocs(reviewsQuery);
      setRecentActivity(reviewsSnap.docs.map(doc => ({
        id: doc.id,
        type: 'review',
        ...doc.data()
      })));
    } catch (error) {
      console.error('Error fetching activity:', error);
    }
  };

  const menuItems = [
    { 
      icon: FaMusic, 
      label: 'Songs', 
      href: '/admin/songs', 
      count: stats.songs,
      color: 'bg-blue-500',
      description: 'Manage your music library'
    },
    { 
      icon: FaVideo, 
      label: 'Videos', 
      href: '/admin/videos', 
      count: stats.videos,
      color: 'bg-green-500',
      description: 'Manage YouTube videos'
    },
    { 
      icon: FaComments, 
      label: 'Comments', 
      href: '/admin/comments', 
      count: stats.comments,
      color: 'bg-purple-500',
      description: 'Moderate user comments'
    },
    { 
      icon: FaStar, 
      label: 'Reviews', 
      href: '/admin/reviews', 
      count: stats.reviews,
      color: 'bg-yellow-500',
      description: 'Manage user reviews'
    },
    { 
      icon: FaChartBar, 
      label: 'Analytics', 
      href: '/admin/analytics', 
      color: 'bg-red-500',
      description: 'View engagement stats'
    },
  ];

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner w-16 h-16"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-2">Welcome back, Admin!</h1>
        <p className="text-gray-600 mb-8">Here's what's happening with NWTN MUSICAL</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Songs</p>
                <h3 className="text-3xl font-bold text-primary">{stats.songs}</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FaMusic className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Videos</p>
                <h3 className="text-3xl font-bold text-primary">{stats.videos}</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FaVideo className="text-green-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Plays</p>
                <h3 className="text-3xl font-bold text-primary">{stats.totalPlays.toLocaleString()}</h3>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <FaEye className="text-yellow-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Reviews</p>
                <h3 className="text-3xl font-bold text-primary">{stats.reviews}</h3>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <FaStar className="text-purple-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Comments</p>
                <h3 className="text-3xl font-bold text-primary">{stats.comments}</h3>
              </div>
              <div className="bg-pink-100 p-3 rounded-full">
                <FaComments className="text-pink-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {menuItems.map((item, index) => (
            <Link key={index} href={item.href}>
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer group">
                <div className="flex items-start gap-4">
                  <div className={`${item.color} p-4 rounded-lg text-white group-hover:scale-110 transition`}>
                    <item.icon size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800 text-lg">{item.label}</h3>
                      {item.count !== undefined && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                          {item.count}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <h2 className="text-2xl font-bold mb-4">Recent Reviews</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {recentActivity.length > 0 ? (
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Review
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentActivity.map((activity) => (
                  <tr key={activity.id}>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{activity.name}</div>
                        <div className="text-sm text-gray-500">{activity.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={i < activity.rating ? 'text-yellow-400' : 'text-gray-300'}
                            size={16}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {activity.review?.substring(0, 50)}...
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        activity.status === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {activity.status || 'pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center py-8 text-gray-500">No recent activity</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
