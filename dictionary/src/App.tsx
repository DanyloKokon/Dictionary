import { Routes, Route } from "react-router";
import './App.css';
import Home from "./components/Home";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/search" element={<Home />} />
    </Routes>
  );
}

export default App;
