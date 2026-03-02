import { NuqsAdapter } from "nuqs/adapters/react";
import Home from "./Home";

function App() {
  return (
    <NuqsAdapter>
      <Home />
    </NuqsAdapter>
  );
}

export default App;
