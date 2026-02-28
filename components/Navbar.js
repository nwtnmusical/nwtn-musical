import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FaMusic, FaVideo, FaStar, FaBars, FaTimes } from 'react-icons/fa';
import { useSession } from 'next-auth/react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!mounted) return null;

  const navLinks = [
    { href: '/', label: 'Home', icon: FaMusic },
    { href: '/songs', label: 'Songs', icon: FaMusic },
    { href: '/videos', label: 'Videos', icon: FaVideo },
    { href: '/reviews', label: 'Reviews', icon: FaStar },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-primary-dark/95 backdrop-blur-lg shadow-lg' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-10 h-10">
              <Image
                src="/logo.png"
                alt="NWTN MUSICAL"
                fill
                className="object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <span className="text-xl font-bold text-white hidden sm:inline">NWTN MUSICAL</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 text-white hover:text-primary-light transition ${
                  router.pathname === link.href ? 'text-primary-light' : ''
                }`}
              >
                <link.icon size={16} />
                {link.label}
              </Link>
            ))}
            
            {session ? (
              <Link
                href="/admin"
                className="bg-white text-primary px-4 py-2 rounded-lg hover:bg-primary-light transition"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/admin/login"
                className="bg-white text-primary px-4 py-2 rounded-lg hover:bg-primary-light transition"
              >
                Admin Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white text-2xl"
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 bg-primary-dark/95 backdrop-blur-lg rounded-b-lg">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 px-4 text-white hover:bg-white/10"
                onClick={() => setIsOpen(false)}
              >
                <link.icon className="inline mr-2" />
                {link.label}
              </Link>
            ))}
            {session ? (
              <Link
                href="/admin"
                className="block py-2 px-4 text-white hover:bg-white/10"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/admin/login"
                className="block py-2 px-4 text-white hover:bg-white/10"
                onClick={() => setIsOpen(false)}
              >
                Admin Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
