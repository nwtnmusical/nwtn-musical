import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaYoutube, FaEye } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Image from 'next/image';
import YouTube from 'react-youtube';

export default function VideosManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    youtubeId: '',
    description: '',
    thumbnail: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchVideos();
    }
  }, [session]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = videos.filter(video => 
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredVideos(filtered);
    } else {
      setFilteredVideos(videos);
    }
  }, [searchTerm, videos]);

  const fetchVideos = async () => {
    try {
      const videosQuery = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(videosQuery);
      const videosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVideos(videosData);
      setFilteredVideos(videosData);
    } catch (error) {
      toast.error('Error fetching videos');
    } finally {
      setLoading(false);
    }
  };

  // Extract YouTube ID from URL if full URL is provided
  const extractYoutubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const youtubeId = extractYoutubeId(formData.youtubeId);
      
      // Auto-generate thumbnail if not provided
      const thumbnail = formData.thumbnail || `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;

      const videoData = {
        title: formData.title,
        youtubeId: youtubeId,
        description: formData.description,
        thumbnail: thumbnail,
        updatedAt: new Date()
      };

      if (editingVideo) {
        await updateDoc(doc(db, 'videos', editingVideo.id), videoData);
        toast.success('Video updated successfully');
      } else {
        await addDoc(collection(db, 'videos'), {
          ...videoData,
          createdAt: new Date(),
          views: 0
        });
        toast.success('Video added successfully');
      }

      setShowModal(false);
      resetForm();
      fetchVideos();
    } catch (error) {
      toast.error('Error saving video');
    }
  };

  const handleDelete = async (video) => {
    if (confirm('Are you sure you want to delete this video?')) {
      try {
        await deleteDoc(doc(db, 'videos', video.id));
        toast.success('Video deleted successfully');
        fetchVideos();
      } catch (error) {
        toast.error('Error deleting video');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      youtubeId: '',
      description: '',
      thumbnail: ''
    });
    setEditingVideo(null);
    setPreviewVideo(null);
  };

  const getYoutubeThumbnail = (youtubeId) => {
    return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
  };

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
      <div className="bg-white rounded-lg shadow">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-2xl font-bold">Videos Management</h2>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary w-full"
                />
              </div>

              {/* Add Button */}
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-dark transition"
              >
                <FaPlus />
                Add New Video
              </button>
            </div>
          </div>
        </div>

        {/* Videos Grid */}
        <div className="p-6">
          {filteredVideos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video) => (
                <div key={video.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
                  {/* Thumbnail */}
                  <div className="relative h-48 group">
                    <Image
                      src={video.thumbnail || getYoutubeThumbnail(video.youtubeId)}
                      alt={video.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <a
                        href={`https://youtube.com/watch?v=${video.youtubeId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-primary text-white p-3 rounded-full hover:scale-110 transition"
                      >
                        <FaYoutube size={24} />
                      </a>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-1">{video.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{video.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <FaEye />
                        <span>{video.views || 0} views</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingVideo(video);
                            setFormData({
                              title: video.title,
                              youtubeId: video.youtubeId,
                              description: video.description || '',
                              thumbnail: video.thumbnail || ''
                            });
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-2"
                          title="Edit"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(video)}
                          className="text-red-600 hover:text-red-900 p-2"
                          title="Delete"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FaYoutube className="mx-auto text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500">No videos found</p>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="mt-4 text-primary hover:text-primary-dark"
              >
                Add your first video
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-primary text-white p-6 rounded-t-xl">
              <h3 className="text-xl font-bold">
                {editingVideo ? 'Edit Video' : 'Add New Video'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* YouTube URL/ID Preview */}
              {formData.youtubeId && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preview
                  </label>
                  <div className="relative pt-[56.25%] bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={getYoutubeThumbnail(extractYoutubeId(formData.youtubeId))}
                      alt="Preview"
                      className="absolute top-0 left-0 w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  placeholder="Enter video title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  YouTube URL or ID *
                </label>
                <input
                  type="text"
                  required
                  value={formData.youtubeId}
                  onChange={(e) => setFormData({...formData, youtubeId: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  placeholder="https://youtube.com/watch?v=... or video ID"
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can paste the full YouTube URL or just the video ID
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary resize-none"
                  placeholder="Enter video description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Thumbnail URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({...formData, thumbnail: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  placeholder="https://example.com/thumbnail.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  If not provided, YouTube thumbnail will be used automatically
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition"
                >
                  {editingVideo ? 'Update Video' : 'Add Video'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
