import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

export default function Analytics() {
  const [analytics, setAnalytics] = useState({
    dailyPlays: [],
    topSongs: [],
    userEngagement: [],
    deviceStats: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    // Fetch songs play counts
    const songsSnap = await getDocs(query(collection(db, 'songs'), orderBy('plays', 'desc'), limit(5)));
    const topSongs = songsSnap.docs.map(doc => ({
      name: doc.data().title,
      plays: doc.data().plays || 0
    }));

    // Fetch daily plays (you'd need to implement this tracking)
    const dailyPlays = [
      { day: 'Mon', plays: 65 },
      { day: 'Tue', plays: 59 },
      { day: 'Wed', plays: 80 },
      { day: 'Thu', plays: 81 },
      { day: 'Fri', plays: 56 },
      { day: 'Sat', plays: 55 },
      { day: 'Sun', plays: 40 }
    ];

    // Device statistics
    const deviceStats = [
      { name: 'Mobile', value: 400 },
      { name: 'Desktop', value: 300 },
      { name: 'Tablet', value: 200 },
      { name: 'TV', value: 100 }
    ];

    setAnalytics({
      dailyPlays,
      topSongs,
      deviceStats
    });
  };

  const COLORS = ['#d12200', '#a51502', '#f8c5c0', '#cf2100'];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-[#d12200] text-white p-6">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-[#f8c5c0]">Track your music engagement</p>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500">Total Plays</h3>
            <p className="text-3xl font-bold text-[#d12200]">12,345</p>
            <p className="text-green-600 text-sm">↑ 12% from last week</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500">Unique Listeners</h3>
            <p className="text-3xl font-bold text-[#d12200]">8,901</p>
            <p className="text-green-600 text-sm">↑ 8% from last week</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500">Avg. Listen Time</h3>
            <p className="text-3xl font-bold text-[#d12200]">3:24</p>
            <p className="text-green-600 text-sm">↑ 2% from last week</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500">Total Reviews</h3>
            <p className="text-3xl font-bold text-[#d12200]">342</p>
            <p className="text-green-600 text-sm">↑ 15% from last week</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Daily Plays Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Daily Plays</h2>
            <LineChart width={500} height={300} data={analytics.dailyPlays}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="plays" stroke="#d12200" />
            </LineChart>
          </div>

          {/* Top Songs Bar Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Top Songs</h2>
            <BarChart width={500} height={300} data={analytics.topSongs}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="plays" fill="#d12200" />
            </BarChart>
          </div>

          {/* Device Statistics Pie Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Device Distribution</h2>
            <PieChart width={400} height={300}>
              <Pie
                data={analytics.deviceStats}
                cx={200}
                cy={150}
                labelLine={false}
                label={entry => entry.name}
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
          </div>
        </div>
      </div>
    </div>
  );
}
