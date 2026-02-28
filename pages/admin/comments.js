import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, deleteDoc, doc, updateDoc, addDoc } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { FaTrash, FaReply, FaCheck, FaTimes, FaUser, FaMusic } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function CommentsManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [comments, setComments] = useState([]);
  const [filteredComments, setFilteredComments] = useState([]);
  const [songs, setSongs] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved
  const [replyModal, setReplyModal] = useState({ show: false, comment: null, reply: '' });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchComments();
      fetchSongs();
    }
  }, [session]);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredComments(comments);
    } else {
      setFilteredComments(comments.filter(c => c.status === filter));
    }
  }, [filter, comments]);

  const fetchComments = async () => {
    try {
      const commentsQuery = query(collection(db, 'comments'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(commentsQuery);
      const commentsData = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      setComments(commentsData);
    } catch (error) {
      toast.error('Error fetching comments');
    } finally {
      setLoading(false);
    }
  };

  const fetchSongs = async () => {
    try {
      const songsSnap = await getDocs(collection(db, 'songs'));
      const songsMap = {};
      songsSnap.forEach(doc => {
        songsMap[doc.id] = doc.data().title;
      });
      setSongs(songsMap);
    } catch (error) {
      console.error('Error fetching songs:', error);
    }
  };

  const handleStatusChange = async (commentId, status) => {
    try {
      await updateDoc(doc(db, 'comments', commentId), {
        status: status,
        updatedAt: new Date()
      });
      toast.success(`Comment ${status}`);
      fetchComments();
    } catch (error) {
      toast.error('Error updating comment');
    }
  };

  const handleDelete = async (commentId) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteDoc(doc(db, 'comments', commentId));
        toast.success('Comment deleted successfully');
        fetchComments();
      } catch (error) {
        toast.error('Error deleting comment');
      }
    }
  };

  const handleReply = async () => {
    if (!replyModal.reply.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    try {
      const replyData = {
        commentId: replyModal.comment.id,
        text: replyModal.reply,
        userId: session.user.uid,
        userName: 'Admin',
        createdAt: new Date()
      };

      // Add reply to subcollection or update comment with reply
      await addDoc(collection(db, 'comments', replyModal.comment.id, 'replies'), replyData);
      
      // Update comment to show it has replies
      await updateDoc(doc(db, 'comments', replyModal.comment.id), {
        hasReplies: true,
        updatedAt: new Date()
      });

      toast.success('Reply posted successfully');
      setReplyModal({ show: false, comment: null, reply: '' });
      fetchComments();
    } catch (error) {
      toast.error('Error posting reply');
    }
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
            <h2 className="text-2xl font-bold">Comments Management</h2>
            
            {/* Filter Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'all' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({comments.length})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'pending' 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending ({comments.filter(c => c.status === 'pending').length})
              </button>
              <button
                onClick={() => setFilter('approved')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'approved' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Approved ({comments.filter(c => c.status === 'approved').length})
              </button>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="p-6">
          {filteredComments.length > 0 ? (
            <div className="space-y-4">
              {filteredComments.map((comment) => (
                <div key={comment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  {/* Comment Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <FaUser className="text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{comment.userName}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{comment.userEmail}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(comment.createdAt, { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      comment.status === 'approved' 
                        ? 'bg-green-100 text-green-800'
                        : comment.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {comment.status || 'pending'}
                    </span>
                  </div>

                  {/* Song Info */}
                  {comment.songId && songs[comment.songId] && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3 bg-gray-50 p-2 rounded">
                      <FaMusic className="text-primary" />
                      <span>On song: <strong>{songs[comment.songId]}</strong></span>
                    </div>
                  )}

                  {/* Comment Text */}
                  <p className="text-gray-700 mb-4">{comment.text}</p>

                  {/* Reply Section */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-8 mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Admin Reply:</p>
                      {comment.replies.map((reply, index) => (
                        <p key={index} className="text-sm text-gray-600">{reply}</p>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                    {comment.status !== 'approved' && (
                      <button
                        onClick={() => handleStatusChange(comment.id, 'approved')}
                        className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
                      >
                        <FaCheck size={12} />
                        Approve
                      </button>
                    )}
                    
                    {comment.status !== 'rejected' && (
                      <button
                        onClick={() => handleStatusChange(comment.id, 'rejected')}
                        className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                      >
                        <FaTimes size={12} />
                        Reject
                      </button>
                    )}
                    
                    <button
                      onClick={() => setReplyModal({ show: true, comment, reply: '' })}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                    >
                      <FaReply size={12} />
                      Reply
                    </button>
                    
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm ml-auto"
                    >
                      <FaTrash size={12} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FaUser className="mx-auto text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500">No comments found</p>
            </div>
          )}
        </div>
      </div>

      {/* Reply Modal */}
      {replyModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="bg-primary text-white p-6 rounded-t-xl">
              <h3 className="text-xl font-bold">Reply to Comment</h3>
            </div>
            
            <div className="p-6">
              {/* Original Comment */}
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-semibold mb-2">Original Comment:</p>
                <p className="text-gray-700">{replyModal.comment?.text}</p>
                <p className="text-xs text-gray-500 mt-2">
                  By: {replyModal.comment?.userName} ({replyModal.comment?.userEmail})
                </p>
              </div>

              <textarea
                value={replyModal.reply}
                onChange={(e) => setReplyModal({ ...replyModal, reply: e.target.value })}
                placeholder="Type your reply here..."
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary resize-none mb-4"
              />

              <div className="flex gap-3">
                <button
                  onClick={handleReply}
                  className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition"
                >
                  Post Reply
                </button>
                <button
                  onClick={() => setReplyModal({ show: false, comment: null, reply: '' })}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
