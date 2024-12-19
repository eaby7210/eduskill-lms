/* eslint-disable react/prop-types */
/* eslint-disable react-refresh/only-export-components */
import { useState } from "react";
import { useLoaderData, useParams, Form, useNavigate } from "react-router-dom";
import User from "../svgs/User";
import apiClient from "../../apis/interceptors/axios";

export async function loader({ params }) {
  try {
    const reviewsResponse = await apiClient.get(
      `/courses/${params.slug}/rate_list/`
    );
    const userReviewResponse = await apiClient.get(
      `/courses/${params.slug}/rate_detail/`
    );

    return {
      reviews: reviewsResponse.data,
      userReview: userReviewResponse.data,
    };
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return { reviews: [], userReview: null };
  }
}

export function Component() {
  const { reviews, userReview } = useLoaderData();
  const { slug } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(userReview?.rating || 0);
  const [reviewText, setReviewText] = useState(userReview?.review || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Render star rating
  const StarRating = ({
    rating,
    onChange,
    editable = false,
    className = "",
  }) => {
    const handleRatingChange = (e) => {
      if (editable) {
        setRating(parseInt(e.target.value));
        if (onChange) onChange(parseInt(e.target.value));
      }
    };

    return (
      <div className={`rating ${className}`}>
        {[5, 4, 3, 2, 1].map((star) => (
          <input
            key={star}
            type="radio"
            name="rating"
            className="mask mask-star-2 bg-green-500"
            value={star}
            checked={rating === star}
            onChange={handleRatingChange}
            disabled={!editable}
          />
        ))}
      </div>
    );
  };

  // Handle review submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const endpoint = userReview
        ? `/courses/${slug}/rate_detail/`
        : `/courses/${slug}/rate/`;

      const method = userReview ? "put" : "post";

      const response = await apiClient[method](endpoint, {
        rating,
        review: reviewText,
      });
      if (response.status >= 200 && response.status < 300) {
        navigate(`/courses/${slug}/learn/reviews`);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      // Handle error (show toast, etc.)
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate average rating
  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  return (
    <div className="container mx-auto p-4">
      {/* Overall Course Rating */}
      <div className="bg-base-200 rounded-xl p-6 mb-8 flex flex-col items-center">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-primary mb-2">
            Course Ratings
          </h2>
          <div className="flex items-center space-x-2">
            <StarRating rating={Math.round(averageRating)} />
            <span className="text-xl font-semibold">
              {averageRating.toFixed(1)}
            </span>
          </div>
          <p className="text-base-content/70 mt-2">
            Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Modal Toggle Button */}
        <button
          onClick={() => document.getElementById("review_modal").showModal()}
          className="btn btn-primary btn-outline"
        >
          {userReview ? "Edit Review" : "Write a Review"}
        </button>

        {/* Review Modal */}
        <dialog
          id="review_modal"
          className="modal modal-bottom md:modal-middle"
        >
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              {userReview ? "Update Your Review" : "Write a Review"}
            </h3>

            <Form method="post" onSubmit={handleSubmit} className="w-full">
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Your Rating</span>
                </label>
                <StarRating
                  rating={rating}
                  onChange={setRating}
                  editable={true}
                  className="mx-auto"
                />
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Your Review</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-24"
                  placeholder="Write your review here..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="modal-action">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="loading loading-spinner"></span>
                  ) : userReview ? (
                    "Update Review"
                  ) : (
                    "Submit Review"
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() =>
                    document.getElementById("review_modal").close()
                  }
                >
                  Cancel
                </button>
              </div>
            </Form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      </div>

      {/* Reviews List */}
      <div>
        <h3 className="text-2xl font-bold mb-6 text-primary">
          Student Reviews
        </h3>

        {reviews.length === 0 ? (
          <div className="alert alert-info">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>No reviews yet. Be the first to review!</span>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-base-200 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <User className="w-6 h-6 text-primary" />
                    <span className="font-semibold">{review.user_name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StarRating rating={review.rating} />
                    <span className="text-sm text-base-content/70">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="text-base-content/80">{review.review}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
