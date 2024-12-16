import { useOutletContext } from "react-router-dom";

export function Component() {
  const { courseData } = useOutletContext();

  // Format duration to hours and minutes
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0
      ? `${hours} hour${hours !== 1 ? "s" : ""} ${remainingMinutes} min${
          remainingMinutes !== 1 ? "s" : ""
        }`
      : `${minutes} min${minutes !== 1 ? "s" : ""}`;
  };

  return (
    <div className="container mx-auto p-4">
      {/* Course Hero Section */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Course Thumbnail
        <div className="aspect-video">
          <img
            src={courseData.course_thumbnail}
            alt={courseData.title}
            className="w-full h-full object-cover rounded-xl shadow-lg"
          />
        </div> */}

        {/* Course Quick Info */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-primary">
            {courseData.title}
          </h1>
          <p className="text-base-content/70">{courseData.description}</p>

          <div className="grid grid-cols-2 gap-4">
            {[
              {
                // icon: <FaChalkboardTeacher className="text-primary" />,
                label: "Instructor",
                value: courseData.teacher_name,
              },
              {
                // icon: <FaClock className="text-primary" />,
                label: "Duration",
                value: formatDuration(courseData.duration),
              },
              {
                // icon: <FaTag className="text-primary" />,
                label: "Category",
                value: courseData.category,
              },
              {
                // icon: <FaCertificate className="text-primary" />,
                label: "Certificate",
                value: courseData.completion_certificate
                  ? "Available"
                  : "Not Offered",
              },
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="text-2xl">{item.icon}</div>
                <div>
                  <p className="text-xs text-base-content/50">{item.label}</p>
                  <p className="font-semibold">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold text-primary">
              {courseData.affected_price === 0
                ? "Free"
                : `₹${courseData.affected_price.toFixed(2)}`}
            </div>
            {courseData.discount_percent && (
              <div className="badge badge-success">
                {courseData.discount_percent}% OFF
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Course Information */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Learning Objectives */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-primary">
            Learning Objectives
          </h2>
          <ul className="list-disc list-inside space-y-2">
            {courseData.learning_objectives
              .split("\n")
              .map((objective, index) => (
                <li key={index} className="text-base-content/80">
                  {objective.trim()}
                </li>
              ))}
          </ul>
        </div>

        {/* Requirements and Target Audience */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-4 text-primary">
              Requirements
            </h2>
            <ul className="list-disc list-inside space-y-2">
              {courseData.requirements.split("\n").map((req, index) => (
                <li key={index} className="text-base-content/80">
                  {req.trim()}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4 text-primary">
              Target Audience
            </h2>
            <ul className="list-disc list-inside space-y-2">
              {courseData.target_audience.split("\n").map((audience, index) => (
                <li key={index} className="text-base-content/80">
                  {audience.trim()}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Syllabus */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4 text-primary">
          Course Syllabus
        </h2>
        <div className="prose max-w-none">{courseData.syllabus}</div>
      </div>
    </div>
  );
}
