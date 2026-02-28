import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { db } from '@/lib/firebase';
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
          <div className="loading-spinner w-12
