import React, { useState } from 'react';
import { StarRating } from './StarRating';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleStarClick = (value: number) => {
    setRating(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSubmit(rating, comment);
      setSuccess(true);
      setComment('');
      setRating(5);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (e: any) {
      setError(e.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-cyan-900">Leave a Review</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4 flex items-center gap-2">
            {[1,2,3,4,5].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleStarClick(val)}
                aria-label={`Rate ${val} stars`}
                className="focus:outline-none"
              >
                <svg
                  width={28}
                  height={28}
                  viewBox="0 0 24 24"
                  fill={val <= rating ? '#FFD700' : '#E5E7EB'}
                  stroke="#FFD700"
                  strokeWidth="1"
                  className="inline-block mx-0.5"
                >
                  <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                </svg>
              </button>
            ))}
            <span className="ml-2 text-cyan-900 font-medium">{rating}/5</span>
          </div>
          <textarea
            className="w-full border border-cyan-200 rounded-md p-2 mb-4 resize-none focus:ring-2 focus:ring-cyan-400"
            rows={4}
            placeholder="Write a short review about the transaction..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            required
            maxLength={500}
          />
          {error && <div className="text-red-500 mb-2">{error}</div>}
          {success && <div className="text-green-600 mb-2">Review submitted!</div>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-lime-600 text-white rounded hover:bg-lime-700"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
