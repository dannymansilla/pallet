import Lottie from "react-lottie-player";
import animationData from "../assets/subtle_background.json";

const SubtleBackground = () => {
  return (
    <div
      style={{
        position: "absolute",
        width: "100vw",
        height: "100vh", // Matches hero section height
        top: 0,
        left: 0,
        zIndex: -1, // Ensures it stays in the background
        overflow: "hidden",
        pointerEvents: "none",
        backgroundColor: "white", // Prevents unwanted colors
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
          opacity: 0.75, // Adjust to make it subtle
        //   backgroundColor: "#FFF3E0",
        color:"black",
        }}
      />
    </div>
  );
};

export default SubtleBackground;
