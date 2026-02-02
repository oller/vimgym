import { NuqsAdapter } from "nuqs/adapters/react";
import { useState } from "react";
import { SplashScreen } from "./components/SplashScreen/SplashScreen";
import Home from "./Home";

function App() {
  const [showSplash, setShowSplash] = useState(false);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <NuqsAdapter>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <Home />
    </NuqsAdapter>
  );
}

export default App;
