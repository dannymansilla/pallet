import Lottie from "react-lottie-player";
import animationData from "../assets/background-animation.json"; // Ensure correct path

const LottieBackground = () => {
  return (
    <div
      style={{
        position: "absolute",
        width: "100vw",
        height: "100vh",
        top: 0,
        left: 0,
        transform: "transalate(-5%)",
        zIndex: -1, // Keep it behind everything
        overflow: "hidden",
        pointerEvents: "none", // Prevents it from blocking interactions
        backgroundColor: "white", // Ensures no red margin
      }}
    >
      <Lottie
        loop
        animationData={animationData}
        play
        style={{
          width: "100vw", // Full width
          height: "110vh", // Full height
          position: "absolute",
          top: "0", // Moves it up slightly
          left: "0", // Moves it left slightly
          opacity: 0.15, // Adjust to make it subtle
          backgroundColor: "blue",
        }}
      />
    </div>
  );
};

export default LottieBackground;
