import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut } from 'next-auth/react';
import { 
  FaMusic, 
  FaVideo, 
  FaComments, 
  FaStar, 
  FaChartBar, 
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaHome
} from 'react-icons/fa';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const menuItems = [
    { href: '/admin', label: 'Dashboard', icon: FaHome },
    { href: '/admin/songs', label: 'Songs', icon: FaMusic },
    { href: '/admin/videos', label: 'Videos', icon: FaVideo },
    { href: '/admin/comments', label: 'Comments', icon: FaComments },
    { href: '/admin/reviews', label: 'Reviews', icon: FaStar },
    { href: '/admin/analytics', label: 'Analytics', icon: FaChartBar },
    { href: '/admin/settings', label: 'Settings', icon: FaCog },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden bg-primary text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">NWTN ADMIN</h1>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 transition duration-200 ease-in-out z-30 w-64 bg-primary text-white`}>
        <div className="h-full flex flex-col">
          <div className="p-6">
            <h2 className="text-2xl font-bold">NWTN ADMIN</h2>
            <p className="text-primary-light text-sm mt-1">Music Management</p>
          </div>

          <nav className="flex-1 px-4">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition ${
                  router.pathname === item.href
                    ? 'bg-white text-primary'
                    : 'text-white hover:bg-white/10'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-primary-light">
            <button
              onClick={() => signOut()}
              className="flex items-center gap-3 px-4 py-3 w-full text-white hover:bg-white/10 rounded-lg transition"
            >
              <FaSignOutAlt size={20} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen">
        <div className="bg-white shadow">
          <div className="container mx-auto px-6 py-4">
            <h1 className="text-2xl font-bold text-primary">
              {menuItems.find(item => item.href === router.pathname)?.label || 'Dashboard'}
            </h1>
          </div>
        </div>
        <main className="container mx-auto px-6 py-8">
          {children}
        </main>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
