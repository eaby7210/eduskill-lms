import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const heroBanners = [
  {
    gradient: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500",
    title: "Learn Anytime, Anywhere",
    description:
      "Unlock your potential with our comprehensive online courses. Flexible learning that fits your life.",
    buttonText: "Explore Courses",
    buttonLink: "/courses",
    buttonStyle: "btn-primary",
    requireAuth: false,
  },
  {
    gradient: "bg-gradient-to-r from-green-400 via-teal-500 to-blue-600",
    title: "Skill Up, Level Up",
    description:
      "Transform your career with expert-led courses in technology, business, and creative fields.",
    buttonText: "My Learning",
    buttonLink: "/user/mylearning",
    buttonStyle: "btn-secondary",
    requireAuth: true,
  },
  {
    gradient: "bg-gradient-to-r from-orange-500 via-red-500 to-pink-500",
    title: "Connect with Experts",
    description:
      "Join a community of learners and interact with industry professionals through our interactive platform.",
    buttonText: "Join Community",
    buttonLink: "/courses/",
    buttonStyle: "btn-accent",
    requireAuth: true,
  },
  {
    gradient: "bg-gradient-to-r from-purple-600 via-indigo-700 to-blue-800",
    title: "Your Learning Journey Starts Here",
    description:
      "Personalized learning paths, cutting-edge content, and flexible schedules to help you achieve your goals.",
    buttonText: "Get Started",
    buttonLink: "/signup",
    buttonStyle: "btn-primary",
    requireAuth: false,
  },
];

export default function Hero() {
  const user = useSelector((state) => state.user);

  const filteredBanners = heroBanners.filter(
    (banner) => !banner.requireAuth || (banner.requireAuth && user?.pk)
  );

  return (
    <div className="carousel w-full">
      {filteredBanners.map((banner, index) => (
        <div
          key={index}
          id={`slide${index + 1}`}
          className="carousel-item relative w-full"
        >
          <div className={`hero min-h-screen ${banner.gradient}`}>
            <div className="hero-overlay bg-opacity-60"></div>
            <div className="hero-content text-center text-neutral-content">
              <div className="max-w-md">
                <h1 className="mb-5 text-5xl font-bold">{banner.title}</h1>
                <p className="mb-5">{banner.description}</p>
                <Link
                  to={banner.buttonLink}
                  className={`btn ${banner.buttonStyle}`}
                >
                  {banner.buttonText}
                </Link>
              </div>
            </div>
          </div>

          {/* Carousel navigation */}
          <div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
            <a
              href={`#slide${index === 0 ? filteredBanners.length : index}`}
              className="btn btn-circle"
            >
              ❮
            </a>
            <a
              href={`#slide${
                index === filteredBanners.length - 1 ? 1 : index + 2
              }`}
              className="btn btn-circle"
            >
              ❯
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
