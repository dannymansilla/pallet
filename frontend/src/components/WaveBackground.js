import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const WaveBackground = () => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        overflow: 'hidden',
        backgroundColor: 'transparent',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          // You can adjust these values using media queries in your CSS
        }}
      >
        <DotLottieReact
          src="https://lottie.host/85577c9e-5c40-4a97-885d-ec3b9e0074d1/YFP3ma0Enq.lottie"
          loop
          autoplay
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    </div>
  );
};

export default WaveBackground;