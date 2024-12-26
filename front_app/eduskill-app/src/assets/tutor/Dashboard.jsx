// import React from "react";
import { useLoaderData, Link, useNavigation } from "react-router-dom";
import Headline from "../admin/components/Headline";

export default function Dashboard() {
  const data = useLoaderData();
  console.log(data);
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

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

  if (isLoading) {
    return (
      <>
        <Headline headline={"Teacher Dashboard"} />
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          {/* Courses Stats Skeleton */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex flex-col">
                <div className="h-8 w-32 skeleton mb-4"></div>
                <div className="h-12 w-16 skeleton mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 w-24 skeleton"></div>
                  <div className="h-4 w-20 skeleton"></div>
                  <div className="h-4 w-28 skeleton"></div>
                </div>
                <div className="h-8 w-32 skeleton mt-4"></div>
              </div>
            </div>
          </div>

          {/* Enrollments Stats Skeleton */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex flex-col">
                <div className="h-8 w-40 skeleton mb-4"></div>
                <div className="h-12 w-16 skeleton mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 w-24 skeleton"></div>
                  <div className="h-4 w-20 skeleton"></div>
                  <div className="h-4 w-28 skeleton"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Stats Skeleton */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex flex-col">
                <div className="h-8 w-36 skeleton mb-4"></div>
                <div className="flex items-baseline gap-2">
                  <div className="h-12 w-16 skeleton"></div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div key={star} className="h-4 w-4 skeleton"></div>
                    ))}
                  </div>
                </div>
                <div className="h-4 w-32 skeleton mt-4"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Reviews Section Skeleton */}
        <section className="mb-8">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="h-8 w-40 skeleton mb-4"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="border-b pb-4">
                    <div className="h-4 w-3/4 skeleton mb-2"></div>
                    <div className="h-4 w-1/2 skeleton"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

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
                {data?.courses?.total_count}
              </p>
              <div className="mt-2 space-y-1">
                {data?.courses?.by_status.map((status) => (
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
                {data?.enrollments.total_count}
              </p>
              <div className="mt-2 space-y-1">
                {data?.enrollments.by_status.map((status) => (
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
                  {data?.reviews.average_rating.toFixed(1)}
                </p>
                <div className="rating rating-sm">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <input
                      key={star}
                      type="radio"
                      name="rating-2"
                      className="mask mask-star-2 bg-primary"
                      checked={
                        Math.round(data?.reviews.average_rating) === star
                      }
                      readOnly
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm mt-2">
                {data?.reviews.recent_reviews.length} recent reviews
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Reviews Section */}
      <section className="mb-8">
        Review section
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title mb-4">Recent Reviews</h2>
            {data?.reviews.recent_reviews.length > 0 ? (
              <div className="space-y-4">
                {data?.reviews.recent_reviews.map((review) => (
                  <div key={review.id} className="border-b pb-4">
                    review
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
