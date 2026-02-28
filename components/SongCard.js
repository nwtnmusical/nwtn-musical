import Image from 'next/image';
import { FaPlay, FaHeart, FaShare } from 'react-icons/fa';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function SongCard({ song, onPlay }) {
  const [isLiked, setIsLiked] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleLike = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    toast.success(isLiked ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleShare = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/song/${song.id}`);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 cursor-pointer group">
      <div className="relative h-48 w-full" onClick={onPlay}>
        <Image
          src={!imageError ? (song.thumbnail || '/default-song.jpg') : '/default-song.jpg'}
          alt={song.title}
          fill
          className="object-cover group-hover:scale-110 transition duration-300"
          onError={() => setImageError(true)}
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-4">
          <button className="bg-primary text-white p-4 rounded-full hover:scale-110 transition shadow-lg">
            <FaPlay />
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-white font-bold text-lg mb-1 truncate">{song.title}</h3>
        <p className="text-primary-light text-sm mb-2">{song.artist}</p>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">{song.duration || '3:45'}</span>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleLike}
              className={`transition ${isLiked ? 'text-red-500' : 'text-white/60 hover:text-red-500'}`}
            >
              <FaHeart />
            </button>
            <button 
              onClick={handleShare}
              className="text-white/60 hover:text-primary-light transition"
            >
              <FaShare />
            </button>
          </div>
        </div>
        <p className="text-white/40 text-xs mt-2">{song.plays || 0} plays</p>
      </div>
    </div>
  );
}
