import { RouterProvider } from "@tanstack/react-router";
import { useState } from "react";
import { SplashScreen } from "./components/SplashScreen/SplashScreen";
import router from "./router";

function App() {
  const [showSplash, setShowSplash] = useState(false);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <RouterProvider router={router} />
    </>
  );
}

export default App;
