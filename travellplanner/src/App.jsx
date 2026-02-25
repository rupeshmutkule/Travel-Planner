import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./component/Home";

/* App.jsx — Removed unused TermsAndConditions import (it's rendered inside Home).
   Single-route app, no additional lazy routing needed here. */
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;