import Image from 'next/image';
import { FaPlay, FaHeart, FaShare } from 'react-icons/fa';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function SongCard({ song, onPlay }) {
  const [isLiked, setIsLiked] = useState(false);

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
    <div className="card group cursor-pointer" onClick={onPlay}>
      <div className="relative h-48 w-full">
        <Image
          src={song.thumbnail || '/default-song.jpg'}
          alt={song.title}
          fill
          className="object-cover group-hover:scale-105 transition duration-300"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-4">
          <button className="bg-primary text-white p-3 rounded-full hover:scale-110 transition">
            <FaPlay />
          </button>
          <button 
            onClick={handleLike}
            className={`p-3 rounded-full transition ${
              isLiked ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/40'
            }`}
          >
            <FaHeart />
          </button>
          <button 
            onClick={handleShare}
            className="bg-white/20 text-white p-3 rounded-full hover:bg-white/40 transition"
          >
            <FaShare />
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-white font-bold text-lg mb-1 truncate">{song.title}</h3>
        <p className="text-primary-light text-sm mb-2">{song.artist}</p>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">{song.duration || '3:45'}</span>
          <span className="text-white/60">{song.plays || 0} plays</span>
        </div>
      </div>
    </div>
  );
}
