import React from 'react';
const BleepLoaderStyles = `
  .bleep-loader .dash {
    animation: bleepDashArray 2s ease-in-out infinite,
      bleepDashOffset 30s linear infinite;
  }

  @keyframes bleepDashArray {
    0% {
      stroke-dasharray: 0 1 359 0;
    }
    50% {
      stroke-dasharray: 0 359 1 0;
    }
    100% {
      stroke-dasharray: 359 1 0 0;
    }
  }

  @keyframes bleepDashOffset {
    0% {
      stroke-dashoffset: 365;
    }
    100% {
      stroke-dashoffset: 5;
    }
  }
`;

const BleepLoader = () => {
  return (
    <div className="bleep-loader flex items-center justify-center bg-transparent rounded-lg">
      {/* Injecting the animation styles directly into the component */}
      <style>{BleepLoaderStyles}</style>

      {/* Hidden SVG to define the color gradients. 
        This is a common SVG technique to define resources that can be reused by ID.
      */}
      <svg height="0" width="0" className="absolute">
        <defs>
          {/* Gradient for 'B' (Purple to Blue) */}
          <linearGradient id="gradB" gradientUnits="userSpaceOnUse" x1="0" y1="62" x2="0" y2="2">
            <stop stopColor="#ff5254"></stop>
            <stop offset="10" stopColor="#FFC800"></stop>
          </linearGradient>
          {/* Gradient for 'L' (Yellow to Pink) */}
          <linearGradient id="gradL" gradientUnits="userSpaceOnUse" x1="0" y1="64" x2="0" y2="0">
            <stop stopColor="#FFC800"></stop>
            <stop offset="1" stopColor="#FF00FF"></stop>
          </linearGradient>
          {/* Gradient for first 'E' (Cyan to Green) */}
          <linearGradient id="gradE1" gradientUnits="userSpaceOnUse" x1="0" y1="62" x2="0" y2="2">
            <stop stopColor="#00E0ED"></stop>
            <stop offset="1" stopColor="#FF00FF"></stop>
          </linearGradient>
          {/* Gradient for second 'E' (Orange to Red) */}
          <linearGradient id="gradE2" gradientUnits="userSpaceOnUse" x1="0" y1="62" x2="0" y2="2">
            <stop stopColor="#ff9a00"></stop>
            <stop offset="1" stopColor="#ff5252"></stop>
          </linearGradient>
          {/* Gradient for 'P' (Lime to Teal) */}
          <linearGradient id="gradP" gradientUnits="userSpaceOnUse" x1="0" y1="64" x2="0" y2="0">
            <stop stopColor="#A8E063"></stop>
            <stop offset="1" stopColor="#FFC819"></stop>
          </linearGradient>
        </defs>
      </svg>

      {/* SVG for the letter 'B' */}
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M 14 60 V 4 H 32 C 50 4 50 28 32 28 H 14 C 14 28 40 28 40 44 C 40 60 28 60 14 60 Z"
          stroke="url(#gradB)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="dash"
          pathLength="360"
        />
      </svg>

      {/* SVG for the letter 'L' */}
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M 14 4 V 60 H 50"
          stroke="url(#gradL)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="dash"
          pathLength="360"
        />
      </svg>

      {/* SVG for the first letter 'E' */}
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M 50 4 H 14 V 60 H 50 M 14 32 H 42"
          stroke="url(#gradE1)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="dash"
          pathLength="360"
        />
      </svg>

      {/* SVG for the second letter 'E' */}
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M 50 4 H 14 V 60 H 50 M 14 32 H 42"
          stroke="url(#gradE2)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="dash"
          pathLength="360"
        />
      </svg>

      {/* SVG for the letter 'P' */}
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M 14 60 V 4 H 36 C 52 4 52 32 36 32 H 14"
          stroke="url(#gradP)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="dash"
          pathLength="360"
        />
      </svg>
    </div>
  );
};

// The main App component to display the loader
export default function App() {
  return (
    <div className="flex items-center justify-center bg-transparent">
      <BleepLoader />
    </div>
  );
}
