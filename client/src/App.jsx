import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Event from "./pages/Event";
import Admin from "./pages/Admin";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/event/:id" element={<Event />} />
        <Route path="/admin/:id" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
