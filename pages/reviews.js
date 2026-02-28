import { useState, useEffect } from 'react';
import Head from 'next/head';
import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import ReviewModal from '../components/ReviewModal';
import { FaStar, FaUser } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    average: 0,
    total: 0,
    distribution: [0, 0, 0, 0, 0]
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const reviewsQuery = query(
        collection(db, 'reviews'), 
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(reviewsQuery);
      const reviewsData = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      setReviews(reviewsData);
      calculateStats(reviewsData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reviewsData) => {
    const distribution = [0, 0, 0, 0, 0];
    let sum = 0;

    reviewsData.forEach(review => {
      if (review.rating) {
        distribution[review.rating - 1]++;
        sum += review.rating;
      }
    });

    const average = reviewsData.length > 0 ? (sum / reviewsData.length).toFixed(1) : 0;

    setStats({
      average,
      total: reviewsData.length,
      distribution
    });
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

  return (
    <>
      <Head>
        <title>NWTN MUSICAL - Reviews</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-primary to-primary-dark">
        <Navbar />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">User Reviews</h1>
            
            <button
              onClick={() => setShowReviewModal(true)}
              className="bg-white text-primary px-6 py-3 rounded-lg hover:bg-primary-light transition font-semibold flex items-center gap-2 justify-center"
            >
              <FaStar />
              Write a Review
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
              <h3 className="text-primary-light mb-2">Average Rating</h3>
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold text-white">{stats.average}</span>
                <div className="flex">{renderStars(Math.round(stats.average))}</div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
              <h3 className="text-primary-light mb-2">Total Reviews</h3>
              <p className="text-4xl font-bold text-white">{stats.total}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
              <h3 className="text-primary-light mb-2">Rating Distribution</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-white text-sm w-8">{rating}★</span>
                    <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400"
                        style={{ 
                          width: `${stats.total > 0 ? (stats.distribution[rating - 1] / stats.total) * 100 : 0}%` 
                        }}
                      />
                    </div>
                    <span className="text-white text-sm w-8">{stats.distribution[rating - 1]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews List */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="loading-spinner w-12 h-12"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/20 p-3 rounded-full">
                      <FaUser className="text-primary-light" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                        <h3 className="text-white font-semibold">{review.name}</h3>
                        <div className="flex items-center gap-2">
                          <div className="flex">{renderStars(review.rating)}</div>
                          <span className="text-primary-light text-sm">
                            {formatDistanceToNow(review.createdAt, { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <p className="text-white/80">{review.review}</p>
                    </div>
                  </div>
                </div>
              ))}

              {reviews.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-white/60 text-lg">No reviews yet. Be the first to review!</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Review Modal */}
        <ReviewModal 
          isOpen={showReviewModal} 
          onClose={() => {
            setShowReviewModal(false);
            fetchReviews(); // Refresh reviews after closing
          }} 
        />
      </div>
    </>
  );
}
