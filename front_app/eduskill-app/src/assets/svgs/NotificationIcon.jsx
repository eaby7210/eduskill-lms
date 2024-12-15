/* eslint-disable react/prop-types */
export default function NotificationIcon({ h, w }) {
  return (
    <svg
      width="256px"
      height="256px"
      viewBox="0 0 24.00 24.00"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${h} ${w} text-primary`} // Example DaisyUI class for color
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M11.7009 7.14697C9.62899 7.14697 8.64717 8.38197 7.66632 10.607C7.09252 12.1293 6.80727 13.75 6.82587 15.382C8.24252 16.4412 9.94777 17.0173 11.7009 17.029C13.454 17.0173 15.1592 16.4412 16.5759 15.382C16.5948 13.75 16.3099 12.1294 15.7364 10.607C14.7546 8.38197 13.7727 7.14697 11.7009 7.14697Z"
          stroke="currentColor" // Use currentColor to inherit the text color
          strokeWidth="0.792"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14.5904 19.2745C14.9209 19.0248 14.9865 18.5545 14.7368 18.224C14.4872 17.8934 14.0168 17.8279 13.6863 18.0775L14.5904 19.2745ZM9.71536 18.0775C9.38484 17.8279 8.91451 17.8934 8.66486 18.224C8.41521 18.5545 8.48078 19.0248 8.81131 19.2745L9.71536 18.0775ZM10.8887 4.75C10.4744 4.75 10.1387 5.08579 10.1387 5.5C10.1387 5.91421 10.4744 6.25 10.8887 6.25V4.75ZM12.513 6.25C12.9272 6.25 13.263 5.91421 13.263 5.5C13.263 5.08579 12.9272 4.75 12.513 4.75V6.25ZM13.6863 18.0775C12.5041 18.9704 10.8975 18.9704 9.71536 18.0775L8.81131 19.2745C10.5285 20.5714 12.8732 20.5714 14.5904 19.2745L13.6863 18.0775ZM10.8887 6.25H12.513V4.75H10.8887V6.25Z"
          fill="currentColor" // Use currentColor to inherit the text color
        />
      </g>
    </svg>
  );
}
