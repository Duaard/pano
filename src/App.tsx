import { BrowserRouter, Routes, Route } from "react-router-dom";
import SessionList from "./pages/SessionList";
import SessionView from "./pages/SessionView";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SessionList />} />
        <Route path="/session/:agent/:id" element={<SessionView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
