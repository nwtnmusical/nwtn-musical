import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';
import { db } from '../../lib/firebase';
import { collection, query, getDocs, orderBy, limit, where } from 'firebase/firestore';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { FaCalendar, FaMusic, FaUsers, FaPlay } from 'react-icons/fa';

export default function Analytics() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [timeframe, setTimeframe] = useState('week');
  const [analytics, setAnalytics] = useState({
    dailyPlays: [],
    topSongs: [],
    deviceStats: [],
    hourlyActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchAnalytics();
    }
  }, [session, timeframe]);

  const fetchAnalytics = async () => {
    try {
      // Fetch top songs
      const songsQuery = query(
        collection(db, 'songs'), 
        orderBy('plays', 'desc'), 
        limit(10)
      );
      const songsSnap = await getDocs(songsQuery);
      const topSongs = songsSnap.docs.map(doc => ({
        name: doc.data().title,
        plays: doc.data().plays || 0
      }));

      // Mock data for demonstration
      const dailyPlays = generateDailyData();
      const deviceStats = generateDeviceData();
      const hourlyActivity = generateHourlyData();

      setAnalytics({
        dailyPlays,
        topSongs,
        deviceStats,
        hourlyActivity
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDailyData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      plays: Math.floor(Math.random() * 1000) + 500,
      listeners: Math.floor(Math.random() * 800) + 300
    }));
  };

  const generateDeviceData = () => {
    return [
      { name: 'Mobile', value: 65 },
      { name: 'Desktop', value: 20 },
      { name: 'Tablet', value: 10 },
      { name: 'TV', value: 5 }
    ];
  };

  const generateHourlyData = () => {
    return Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      plays: Math.floor(Math.random() * 100) + 20
    }));
  };

  const COLORS = ['#d12200', '#a51502', '#f8c5c0', '#cf2100'];

  const stats = [
    {
      label: 'Total Plays',
      value: '124.5K',
      change: '+12.3%',
      icon: FaPlay,
      color: 'bg-blue-500'
    },
    {
      label: 'Active Users',
      value: '2,345',
      change: '+8.1%',
      icon: FaUsers,
      color: 'bg-green-500'
    },
    {
      label: 'Total Songs',
      value: '156',
      change: '+5',
      icon: FaMusic,
      color: 'bg-purple-500'
    },
    {
      label: 'Avg. Session',
      value: '4:32',
      change: '+2.4%',
      icon: FaCalendar,
      color: 'bg-yellow-500'
    }
  ];

  if (status === 'loading' || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner w-12 h-12"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                  <h3 className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</h3>
                  <p className="text-green-600 text-sm mt-2">{stat.change}</p>
                </div>
                <div className={`${stat.color} p-4 rounded-full text-white`}>
                  <stat.icon size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Plays Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Daily Plays & Listeners</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.dailyPlays}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="plays" stroke="#d12200" strokeWidth={2} />
                <Line type="monotone" dataKey="listeners" stroke="#f8c5c0" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top Songs Bar Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Top 10 Songs</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.topSongs} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="plays" fill="#d12200" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Device Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Device Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.deviceStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={entry => `${entry.name}: ${entry.value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.deviceStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Hourly Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Hourly Activity (24h)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.hourlyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="plays" fill="#d12200" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
