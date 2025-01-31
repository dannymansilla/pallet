const SubtleWaveBackground = () => {
    return (
      <div style={{ position: "absolute", width: "100%", height: "100%", zIndex: -1, overflow: "hidden" }}>
        <svg
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            position: "absolute",
            bottom: 0,
            opacity: 0.05, // Subtle effect
            animation: "waveMove 15s ease-in-out infinite alternate",
          }}
          viewBox="0 0 1440 320"
        >
          <path
            fill="#00bcd4"
            fillOpacity="1"
            d="M0,64L48,101.3C96,139,192,213,288,224C384,235,480,181,576,165.3C672,149,768,171,864,181.3C960,192,1056,192,1152,181.3C1248,171,1344,149,1392,138.7L1440,128V320H0Z"
          ></path>
        </svg>
  
        <style>
          {`
            @keyframes waveMove {
              from { transform: translateX(0); }
              to { transform: translateX(-50px); }
            }
          `}
        </style>
      </div>
    );
  };
  
  export default SubtleWaveBackground;
  