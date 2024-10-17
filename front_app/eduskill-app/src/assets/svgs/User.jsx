const User = () => {
  return (
    <svg
      viewBox="-1.6 -1.6 19.20 19.20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="0.5" // Adjust stroke width
      className="w-7 h-9 stroke-current text-primary fill-primary-content" // Tailwind CSS classes
    >
      <g id="User_bgCarrier" strokeWidth="0">
        <rect
          x="-1.6"
          y="-1.6"
          width="19.20"
          height="19.20"
          rx="9.6"
          className="fill-base-100" // Tailwind class to apply background color
        ></rect>
      </g>
      <g
        id="User_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="User_iconCarrier">
        {/* Face of the user icon */}
        <path
          d="M8 7C9.65685 7 11 5.65685 11 4C11 2.34315 9.65685 1 8 1C6.34315 1 5 2.34315 5 4C5 5.65685 6.34315 7 8 7Z"
          className="fill-primary" // Fill the face with primary color
        ></path>

        {/* Body of the user icon */}
        <path
          d="M14 12C14 10.3431 12.6569 9 11 9H5C3.34315 9 2 10.3431 2 12V15H14V12Z"
          className="fill-primary-info"
        ></path>
      </g>
    </svg>
  );
};

export default User;
