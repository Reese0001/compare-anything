import { Navigate, Route, Routes } from "react-router-dom";

import { Home } from "./pages/Home";
import { Result } from "./pages/Result";

function App() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/result" element={<Result />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
