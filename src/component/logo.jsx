// src/components/QariLogo.jsx
import React from 'react';

const QariLogo = ({ className = "h-12 w-12" }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="45" fill="#4F46E5" stroke="#fff" strokeWidth="2" />
      <path
        d="M35 40 L50 30 L65 40 L65 60 L50 70 L35 60 L35 40Z"
        fill="white"
        stroke="#4F46E5"
        strokeWidth="2"
      />
      <text
        x="50"
        y="55"
        textAnchor="middle"
        fill="#4F46E5"
        fontSize="24"
        fontWeight="bold"
        fontFamily="Arial"
      >
        ق
      </text>
    </svg>
  );
};

export default QariLogo;