// import React from "react";

// eslint-disable-next-line react/prop-types
export default function Radio({ name, color, text, checked, value }) {
  return (
    <label className="label cursor-pointer">
      <span className="label-text">{text}</span>
      <input
        type="radio"
        name={name}
        value={value}
        className={`radio radio-${color}`}
        defaultChecked={checked}
      />
    </label>
  );
}
