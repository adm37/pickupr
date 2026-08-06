import React, { useState } from 'react';
import { Star, AlertCircle, CheckCircle } from 'lucide-react';

export default function CustomerRating() {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Extract booking ID or partner ID from URL
  const pathParts = window.location.pathname.split('/');
  const bookingId = pathParts[pathParts.length - 1];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    // Save rating to localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('customerRatings') || '[]');
      
      // Attempt to find which partner this booking belongs to.
      // Since we use mock IDs and multiple places, we might just assign it to a fixed partner for demo 
      // or find the partner in partnerRides.
      const partnerRides = JSON.parse(localStorage.getItem('partnerRides') || '[]');
      const ride = partnerRides.find((r: any) => r.id === bookingId);
      
      // In a real app we'd have a backend. Here, if no ride is found, we apply it to a generic or mock partner
      const partnerId = ride ? ride.partnerId : 'P-001'; 

      stored.push({
        bookingId,
        partnerId,
        score: rating,
        feedback: rating < 5 ? feedback : '',
        date: new Date().toISOString()
      });
      localStorage.setItem('customerRatings', JSON.stringify(stored));
      
      setSubmitted(true);
    } catch(err) {
      console.error("Could not save rating:", err);
    }
  };

  if (submitted) {
    return (
      <div className="pt-32 pb-12 min-h-screen bg-zinc-50 flex items-center justify-center -mt-20">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-200 text-center max-w-md w-full">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Thank you!</h2>
          <p className="text-zinc-500">Your feedback has been submitted successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-12 min-h-screen bg-zinc-50 flex items-center justify-center -mt-20">
      <div className="bg-white px-8 py-10 rounded-2xl shadow-sm border border-zinc-200 max-w-lg w-full m-4">
        <h2 className="text-3xl font-bold font-sans tracking-tight text-zinc-900 text-center mb-2">Rate Your Ride</h2>
        <p className="text-zinc-500 text-center text-sm mb-10">Booking ID: {bookingId}</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex flex-col items-center">
            <p className="text-sm font-medium text-zinc-700 mb-4">How was your chauffeur?</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star 
                    className={`w-10 h-10 ${
                      (hoverRating || rating) >= star 
                        ? 'fill-yellow-500 text-yellow-500' 
                        : 'text-zinc-300'
                    }`} 
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm font-medium mt-4 text-zinc-900">
                {rating === 1 && "Onvoldoende (Insufficient)"}
                {rating === 2 && "Matig (Poor)"}
                {rating === 3 && "Voldoende (Average)"}
                {rating === 4 && "Goed (Good)"}
                {rating === 5 && "Ruim Voldoende (Excellent)"}
              </p>
            )}
          </div>

          {rating > 0 && rating < 5 && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                What went wrong? Please let us know.
              </label>
              <textarea
                required
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="The driver was late, car wasn't clean, etc..."
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          )}
          
          <button
            type="submit"
            disabled={rating === 0}
            className="w-full bg-zinc-900 text-white font-bold py-4 rounded-xl hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Rating
          </button>
        </form>
      </div>
    </div>
  );
}
