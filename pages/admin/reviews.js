import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';
import { FaTrash, FaCheck, FaTimes, FaStar, FaUser } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function ReviewsManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    average: 0,
    pending: 0,
    approved: 0,
    distribution: [0, 0, 0, 0, 0]
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchReviews();
    }
  }, [session]);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredReviews(reviews);
    } else {
      setFilteredReviews(reviews.filter(r => r.status === filter));
    }
  }, [filter, reviews]);

  const fetchReviews = async () => {
    try {
      const reviewsQuery = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(reviewsQuery);
      const reviewsData = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      setReviews(reviewsData);
      calculateStats(reviewsData);
    } catch (error) {
      toast.error('Error fetching reviews');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reviewsData) => {
    const total = reviewsData.length;
    const pending = reviewsData.filter(r => r.status === 'pending').length;
    const approved = reviewsData.filter(r => r.status === 'approved').length;
    
    const distribution = [0, 0, 0, 0, 0];
    let sum = 0;
    let count = 0;

    reviewsData.forEach(review => {
      if (review.rating && review.status === 'approved') {
        distribution[review.rating - 1]++;
        sum += review.rating;
        count++;
      }
    });

    const average = count > 0 ? (sum / count).toFixed(1) : 0;

    setStats({
      total,
      average,
      pending,
      approved,
      distribution
    });
  };

  const handleStatusChange = async (reviewId, status) => {
    try {
      await updateDoc(doc(db, 'reviews', reviewId), {
        status: status,
        updatedAt: new Date()
      });
      toast.success(`Review ${status}`);
      fetchReviews();
    } catch (error) {
      toast.error('Error updating review');
    }
  };

  const handleDelete = async (reviewId) => {
    if (confirm('Are you sure you want to delete this review?')) {
      try {
        await deleteDoc(doc(db, 'reviews', reviewId));
        toast.success('Review deleted successfully');
        fetchReviews();
      } catch (error) {
        toast.error('Error deleting review');
      }
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar
        key={i}
        className={i < rating ? 'text-yellow-400' : 'text-gray-300'}
        size={16}
      />
    ));
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
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm">Total Reviews</h3>
            <p className="text-3xl font-bold text-primary mt-2">{stats.total}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm">Average Rating</h3>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-3xl font-bold text-primary">{stats.average}</p>
              <div className="flex">{renderStars(Math.round(stats.average))}</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm">Pending</h3>
            <p className="text-3xl font-bold text-yellow-500 mt-2">{stats.pending}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm">Approved</h3>
            <p className="text-3xl font-bold text-green-500 mt-2">{stats.approved}</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'all' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'pending' 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending ({stats.pending})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'approved' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Approved ({stats.approved})
            </button>
          </div>
        </div>

        {/* Reviews List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold">Reviews Management</h2>
          </div>

          <div className="p-6">
            {filteredReviews.length > 0 ? (
              <div className="space-y-4">
                {filteredReviews.map((review) => (
                  <div key={review.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    {/* Review Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <FaUser className="text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{review.name}</h4>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-gray-500">
                            <span>{review.email}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>{formatDistanceToNow(review.createdAt, { addSuffix: true })}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <span className={`self-start sm:self-auto px-3 py-1 rounded-full text-xs font-semibold ${
                        review.status === 'approved' 
                          ? 'bg-green-100 text-green-800'
                          : review.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {review.status || 'pending'}
                      </span>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex">{renderStars(review.rating)}</div>
                      <span className="text-sm text-gray-600">({review.rating}/5)</span>
                    </div>

                    {/* Review Text */}
                    <p className="text-gray-700 mb-4">{review.review}</p>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                      {review.status !== 'approved' && (
                        <button
                          onClick={() => handleStatusChange(review.id, 'approved')}
                          className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
                        >
                          <FaCheck size={12} />
                          Approve
                        </button>
                      )}
                      
                      {review.status !== 'rejected' && (
                        <button
                          onClick={() => handleStatusChange(review.id, 'rejected')}
                          className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                        >
                          <FaTimes size={12} />
                          Reject
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDelete(review.id)}
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
                <FaStar className="mx-auto text-6xl text-gray-300 mb-4" />
                <p className="text-gray-500">No reviews found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
