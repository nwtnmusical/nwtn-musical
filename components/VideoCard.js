import { useState } from 'react';
import { FaPlay, FaEye } from 'react-icons/fa';
import Image from 'next/image';
import YouTube from 'react-youtube';

export default function VideoCard({ video }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [imageError, setImageError] = useState(false);

  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      modestbranding: 1,
      rel: 0,
    },
  };

  const thumbnailUrl = video.thumbnail || `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`;

  if (isPlaying) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden">
        <div className="relative pt-[56.25%]">
          <YouTube
            videoId={video.youtubeId}
            opts={opts}
            className="absolute top-0 left-0 w-full h-full"
            onEnd={() => setIsPlaying(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300">
      <div className="relative h-48 w-full cursor-pointer group" onClick={() => setIsPlaying(true)}>
        <Image
          src={!imageError ? thumbnailUrl : '/default-video.jpg'}
          alt={video.title}
          fill
          className="object-cover"
          onError={() => setImageError(true)}
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
          <div className="bg-primary text-white p-4 rounded-full hover:scale-110 transition">
            <FaPlay />
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-white font-bold text-lg mb-2 line-clamp-1">{video.title}</h3>
        <p className="text-primary-light text-sm mb-3 line-clamp-2">{video.description}</p>
        <div className="flex items-center gap-2 text-white/60 text-sm">
          <FaEye />
          <span>{video.views || 0} views</span>
        </div>
      </div>
    </div>
  );
}
