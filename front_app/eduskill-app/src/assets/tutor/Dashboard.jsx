// import React from "react";
import { useLoaderData, Link } from "react-router-dom";
import Headline from "../admin/components/Headline";

export default function Dashboard() {
  const { courses, enrollments, reviews } = useLoaderData();

  const getStatusColor = (status) => {
    switch (status) {
      case "draft":
        return "text-base-content/60";
      case "published":
        return "text-success";
      case "active":
        return "text-info";
      case "completed":
        return "text-secondary";
      default:
        return "text-base-content/60";
    }
  };

  return (
    <>
      <Headline headline={"Teacher Dashboard"} />
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {/* Courses Stats */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex flex-col">
              <h2 className="card-title">Total Courses</h2>
              <p className="text-4xl font-bold text-primary">
                {courses.total_count}
              </p>
              <div className="mt-2 space-y-1">
                {courses.by_status.map((status) => (
                  <p
                    key={status.status}
                    className={`text-sm ${getStatusColor(
                      status.status
                    )} capitalize`}
                  >
                    {status.count} {status.status}
                  </p>
                ))}
              </div>
              <Link
                to="/tutor/courses"
                className="btn btn-primary btn-sm mt-4 self-start"
              >
                Manage Courses
              </Link>
            </div>
          </div>
        </div>

        {/* Enrollments Stats */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex flex-col">
              <h2 className="card-title">Total Enrollments</h2>
              <p className="text-4xl font-bold text-primary">
                {enrollments.total_count}
              </p>
              <div className="mt-2 space-y-1">
                {enrollments.by_status.map((status) => (
                  <p
                    key={status.status}
                    className={`text-sm ${getStatusColor(
                      status.status
                    )} capitalize`}
                  >
                    {status.count} {status.status}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Stats */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex flex-col">
              <h2 className="card-title">Average Rating</h2>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-bold text-primary">
                  {reviews.average_rating.toFixed(1)}
                </p>
                <div className="rating rating-sm">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <input
                      key={star}
                      type="radio"
                      name="rating-2"
                      className="mask mask-star-2 bg-primary"
                      checked={Math.round(reviews.average_rating) === star}
                      readOnly
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm mt-2">
                {reviews.recent_reviews.length} recent reviews
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Reviews Section */}
      <section className="mb-8">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title mb-4">Recent Reviews</h2>
            {reviews.recent_reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.recent_reviews.map((review) => (
                  <div key={review.id} className="border-b pb-4">
                    {/* Add review content here when the data structure is available */}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-base-content/60">No recent reviews</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
