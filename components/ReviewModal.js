import { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { FaStar, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function ReviewModal({ isOpen, onClose }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    review: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        ...formData,
        rating,
        createdAt: serverTimestamp(),
        status: 'pending' // For admin moderation
      });
      
      toast.success('Thank you for your review!');
      onClose();
      setFormData({ name: '', email: '', review: '' });
      setRating(0);
    } catch (error) {
      toast.error('Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-[#d12200]">Rate Us</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-[#d12200]">
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Star Rating */}
          <div className="flex justify-center mb-4">
            {[...Array(5)].map((_, index) => {
              const ratingValue = index + 1;
              return (
                <label key={index}>
                  <input
                    type="radio"
                    name="rating"
                    value={ratingValue}
                    onClick={() => setRating(ratingValue)}
                    className="hidden"
                  />
                  <FaStar
                    className="cursor-pointer transition-colors"
                    size={30}
                    color={ratingValue <= (hover || rating) ? '#ffc107' : '#e4e5e9'}
                    onMouseEnter={() => setHover(ratingValue)}
                    onMouseLeave={() => setHover(0)}
                  />
                </label>
              );
            })}
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Your Name *"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 border border-[#f8c5c0] rounded-lg focus:outline-none focus:border-[#d12200]"
            />
            
            <input
              type="email"
              placeholder="Your Email *"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-2 border border-[#f8c5c0] rounded-lg focus:outline-none focus:border-[#d12200]"
            />
            
            <textarea
              placeholder="Your Review *"
              required
              rows="4"
              value={formData.review}
              onChange={(e) => setFormData({...formData, review: e.target.value})}
              className="w-full px-4 py-2 border border-[#f8c5c0] rounded-lg focus:outline-none focus:border-[#d12200]"
            ></textarea>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#d12200] text-white py-3 rounded-lg hover:bg-[#a51502] transition disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
