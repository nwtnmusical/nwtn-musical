import { useState, useEffect } from 'react';
import { db, storage } from '../../lib/firebase';
import { collection, query, orderBy, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function SongsManagement() {
  const [songs, setSongs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    duration: '',
    thumbnail: null,
    audioFile: null
  });

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    const songsQuery = query(collection(db, 'songs'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(songsQuery);
    setSongs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleFileUpload = async (file, path) => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let thumbnailUrl = editingSong?.thumbnail || '';
      let audioUrl = editingSong?.audioUrl || '';

      // Upload thumbnail if new
      if (formData.thumbnail) {
        thumbnailUrl = await handleFileUpload(
          formData.thumbnail, 
          `thumbnails/${Date.now()}_${formData.thumbnail.name}`
        );
      }

      // Upload audio if new
      if (formData.audioFile) {
        audioUrl = await handleFileUpload(
          formData.audioFile,
          `songs/${Date.now()}_${formData.audioFile.name}`
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
    }
  };

  const handleDelete = async (songId) => {
    if (confirm('Are you sure?')) {
      await deleteDoc(doc(db, 'songs', songId));
      toast.success('Song deleted');
      fetchSongs();
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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-[#d12200] text-white p-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Songs Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-white text-[#d12200] px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <FaPlus />
          <span>Add New Song</span>
        </button>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">Thumbnail</th>
                <th className="px-6 py-3 text-left">Title</th>
                <th className="px-6 py-3 text-left">Artist</th>
                <th className="px-6 py-3 text-left">Duration</th>
                <th className="px-6 py-3 text-left">Plays</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {songs.map((song) => (
                <tr key={song.id} className="border-t">
                  <td className="px-6 py-4">
                    <img src={song.thumbnail} alt={song.title} className="w-12 h-12 object-cover rounded" />
                  </td>
                  <td className="px-6 py-4">{song.title}</td>
                  <td className="px-6 py-4">{song.artist}</td>
                  <td className="px-6 py-4">{song.duration}</td>
                  <td className="px-6 py-4">{song.plays || 0}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setEditingSong(song);
                        setFormData({
                          title: song.title,
                          artist: song.artist,
                          duration: song.duration
                        });
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(song.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-[#d12200] mb-4">
              {editingSong ? 'Edit Song' : 'Add New Song'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Song Title *"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                
                <input
                  type="text"
                  placeholder="Artist Name *"
                  required
                  value={formData.artist}
                  onChange={(e) => setFormData({...formData, artist: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                
                <input
                  type="text"
                  placeholder="Duration (e.g., 3:45)"
                  required
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                
                <div>
                  <label className="block text-sm font-medium mb-2">Thumbnail Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({...formData, thumbnail: e.target.files[0]})}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Audio File (MP3)</label>
                  <input
                    type="file"
                    accept="audio/mp3,audio/mpeg"
                    required={!editingSong}
                    onChange={(e) => setFormData({...formData, audioFile: e.target.files[0]})}
                    className="w-full"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-[#d12200] text-white py-2 rounded-lg hover:bg-[#a51502]"
                  >
                    {editingSong ? 'Update' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
