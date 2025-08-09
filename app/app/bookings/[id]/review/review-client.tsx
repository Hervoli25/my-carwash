'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  Star,
  Car,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  CheckCircle,
  Send
} from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date | string;
}

interface BookingData {
  id: string;
  bookingDate: Date | string;
  timeSlot: string;
  totalAmount: number;
  completedAt: Date | string | null;
  service: {
    id: string;
    name: string;
    description: string;
    category: string;
  };
  vehicle: {
    make: string;
    model: string;
    licensePlate: string;
  };
  addOns: Array<{
    addOn: {
      name: string;
      price: number;
    };
    quantity: number;
    price: number;
  }>;
}

interface ReviewClientProps {
  booking: BookingData;
  existingReview?: Review | null;
}

const StarRating = ({ 
  rating, 
  onRatingChange, 
  readonly = false 
}: { 
  rating: number; 
  onRatingChange?: (rating: number) => void; 
  readonly?: boolean;
}) => {
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onRatingChange && onRatingChange(star)}
          className={`${
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          } transition-transform`}
        >
          <Star
            className={`w-8 h-8 ${
              star <= rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300 hover:text-yellow-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export function ReviewClient({ booking, existingReview }: ReviewClientProps) {
  const router = useRouter();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [submitted, setSubmitted] = useState(!!existingReview);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (comment.trim().length < 10) {
      setError('Please provide a review comment of at least 10 characters');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/bookings/${booking.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          comment: comment.trim(),
          serviceId: booking.service.id
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setSubmitted(true);
      
    } catch (error) {
      console.error('Error submitting review:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return '';
    }
  };

  const completedDate = booking.completedAt 
    ? new Date(booking.completedAt) 
    : new Date(booking.bookingDate);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => router.push('/bookings')}
            className="mb-4"
          >
            ← Back to Bookings
          </Button>
          
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <MessageSquare className="w-6 h-6 mr-2 text-blue-600" />
            {existingReview ? 'Your Review' : 'Leave a Review'}
          </h1>
          <p className="text-gray-600">
            {existingReview 
              ? 'Thank you for your feedback!' 
              : 'Share your experience with our service'}
          </p>
        </div>

        {submitted && !existingReview && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <p className="text-green-800 font-medium">Thank you for your review!</p>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Your feedback helps us improve our services and helps other customers make informed decisions.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Details */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Car className="w-5 h-5 mr-2 text-blue-600" />
                  Service Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{booking.service.name}</h3>
                    <Badge variant="outline">{booking.service.category}</Badge>
                    <p className="text-sm text-gray-600 mt-2">{booking.service.description}</p>
                  </div>
                  
                  <hr className="border-gray-200" />
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Service Date</p>
                      <p className="text-gray-600">{formatDate(new Date(booking.bookingDate))}</p>
                    </div>
                    <div>
                      <p className="font-medium">Time</p>
                      <p className="text-gray-600">{booking.timeSlot}</p>
                    </div>
                    <div>
                      <p className="font-medium">Vehicle</p>
                      <p className="text-gray-600">{booking.vehicle.make} {booking.vehicle.model}</p>
                    </div>
                    <div>
                      <p className="font-medium">Total Paid</p>
                      <p className="text-gray-600 font-semibold">{formatCurrency(booking.totalAmount)}</p>
                    </div>
                  </div>

                  {booking.addOns.length > 0 && (
                    <>
                      <hr className="border-gray-200" />
                      <div>
                        <h4 className="font-medium mb-2">Add-on Services</h4>
                        <div className="space-y-1">
                          {booking.addOns.map((addOn, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{addOn.addOn.name} × {addOn.quantity}</span>
                              <span>{formatCurrency(addOn.price)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="bg-green-50 p-3 rounded text-sm">
                    <p className="font-medium text-green-800">Service Completed</p>
                    <p className="text-green-700">{formatDate(completedDate)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Review Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-500" />
                  {existingReview ? 'Your Review' : 'Rate Your Experience'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Star Rating */}
                <div>
                  <Label className="text-base font-medium">Overall Rating</Label>
                  <p className="text-sm text-gray-500 mb-3">
                    {existingReview 
                      ? 'You rated this service:' 
                      : 'How would you rate our service?'}
                  </p>
                  <div className="flex items-center space-x-4">
                    <StarRating 
                      rating={rating} 
                      onRatingChange={existingReview ? undefined : setRating}
                      readonly={!!existingReview}
                    />
                    {rating > 0 && (
                      <span className="text-sm font-medium text-gray-600">
                        {getRatingLabel(rating)}
                      </span>
                    )}
                  </div>
                </div>

                <hr className="border-gray-200" />

                {/* Comment */}
                <div>
                  <Label className="text-base font-medium">Your Review</Label>
                  <p className="text-sm text-gray-500 mb-3">
                    {existingReview 
                      ? 'Your feedback:' 
                      : 'Tell us about your experience (minimum 10 characters)'}
                  </p>
                  <Textarea
                    placeholder={existingReview 
                      ? '' 
                      : "What did you think of our service? Any suggestions for improvement?"}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    maxLength={1000}
                    readOnly={!!existingReview}
                    className={existingReview ? 'bg-gray-50' : ''}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500">{comment.length}/1000 characters</p>
                    {comment.length >= 10 && !existingReview && (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        <span className="text-xs">Good length</span>
                      </div>
                    )}
                  </div>
                </div>

                {existingReview ? (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800 mb-2">
                      <strong>Review submitted:</strong> {formatDate(new Date(existingReview.createdAt))}
                    </p>
                    <p className="text-xs text-blue-600">
                      Thank you for your feedback! Your review helps us improve our services.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Submit Button */}
                    <Button
                      onClick={handleSubmit}
                      disabled={rating === 0 || comment.trim().length < 10 || isLoading || submitted}
                      className="w-full"
                      size="lg"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isLoading ? 'Submitting...' : submitted ? 'Review Submitted' : 'Submit Review'}
                    </Button>

                    {/* Guidelines */}
                    <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                      <p><strong>Review Guidelines:</strong></p>
                      <ul className="mt-1 space-y-1 list-disc list-inside">
                        <li>Be honest and constructive in your feedback</li>
                        <li>Focus on the service quality and experience</li>
                        <li>Avoid personal information or inappropriate content</li>
                        <li>Help other customers make informed decisions</li>
                      </ul>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}