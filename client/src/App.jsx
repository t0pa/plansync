import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Event from "./pages/Event";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/event/:id" element={<Event />} />
    
      </Routes>
    </BrowserRouter>
  );
}

export default App;
