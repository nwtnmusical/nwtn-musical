import { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function SongsManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    duration: '',
    thumbnail: null,
    audioFile: null
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchSongs();
    }
  }, [session]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = songs.filter(song => 
        song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSongs(filtered);
    } else {
      setFilteredSongs(songs);
    }
  }, [searchTerm, songs]);

  const fetchSongs = async () => {
    try {
      const songsQuery = query(collection(db, 'songs'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(songsQuery);
      const songsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSongs(songsData);
      setFilteredSongs(songsData);
    } catch (error) {
      toast.error('Error fetching songs');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file, path) => {
    const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let thumbnailUrl = editingSong?.thumbnail || '';
      let audioUrl = editingSong?.audioUrl || '';

      // Upload thumbnail if new
      if (formData.thumbnail) {
        thumbnailUrl = await handleFileUpload(
          formData.thumbnail, 
          'thumbnails'
        );
      }

      // Upload audio if new
      if (formData.audioFile) {
        audioUrl = await handleFileUpload(
          formData.audioFile,
          'songs'
        );
      }

      const songData = {
        title: formData.title,
        artist: formData.artist,
        duration: formData.duration,
        thumbnail: thumbnailUrl,
        audioUrl: audioUrl,
        updatedAt: new Date()
      };

      if (editingSong) {
        await updateDoc(doc(db, 'songs', editingSong.id), songData);
        toast.success('Song updated successfully');
      } else {
        await addDoc(collection(db, 'songs'), {
          ...songData,
          createdAt: new Date(),
          plays: 0,
          rating: 0
        });
        toast.success('Song added successfully');
      }

      setShowModal(false);
      resetForm();
      fetchSongs();
    } catch (error) {
      toast.error('Error saving song');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (song) => {
    if (confirm('Are you sure you want to delete this song?')) {
      try {
        // Delete audio file from storage
        if (song.audioUrl) {
          const audioRef = ref(storage, song.audioUrl);
          await deleteObject(audioRef).catch(() => {});
        }
        
        // Delete thumbnail from storage
        if (song.thumbnail) {
          const thumbRef = ref(storage, song.thumbnail);
          await deleteObject(thumbRef).catch(() => {});
        }

        // Delete from Firestore
        await deleteDoc(doc(db, 'songs', song.id));
        toast.success('Song deleted successfully');
        fetchSongs();
      } catch (error) {
        toast.error('Error deleting song');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      artist: '',
      duration: '',
      thumbnail: null,
      audioFile: null
    });
    setEditingSong(null);
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
            <h2 className="text-2xl font-bold">Songs Management</h2>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search songs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
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
                Add New Song
              </button>
            </div>
          </div>
        </div>

        {/* Songs Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thumbnail
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Artist
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plays
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSongs.map((song) => (
                <tr key={song.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="relative h-12 w-12">
                      <Image
                        src={song.thumbnail || '/default-song.jpg'}
                        alt={song.title}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {song.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {song.artist}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {song.duration || '--:--'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {song.plays || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setEditingSong(song);
                        setFormData({
                          title: song.title,
                          artist: song.artist,
                          duration: song.duration || ''
                        });
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="Edit"
                    >
                      <FaEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(song)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <FaTrash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredSongs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No songs found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-primary text-white p-6 rounded-t-xl">
              <h3 className="text-xl font-bold">
                {editingSong ? 'Edit Song' : 'Add New Song'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Song Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  placeholder="Enter song title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Artist Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.artist}
                  onChange={(e) => setFormData({...formData, artist: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  placeholder="Enter artist name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (e.g., 3:45)
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  placeholder="3:45"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thumbnail Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({...formData, thumbnail: e.target.files[0]})}
                  className="w-full"
                />
                {editingSong?.thumbnail && !formData.thumbnail && (
                  <p className="text-sm text-gray-500 mt-1">
                    Current thumbnail will be kept if not changed
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Audio File (MP3) {!editingSong && '*'}
                </label>
                <input
                  type="file"
                  accept="audio/mp3,audio/mpeg"
                  required={!editingSong}
                  onChange={(e) => setFormData({...formData, audioFile: e.target.files[0]})}
                  className="w-full"
                />
                {editingSong?.audioUrl && !formData.audioFile && (
                  <p className="text-sm text-gray-500 mt-1">
                    Current audio will be kept if not changed
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : (editingSong ? 'Update Song' : 'Add Song')}
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
