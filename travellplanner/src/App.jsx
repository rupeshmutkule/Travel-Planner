import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./component/Home";
import TermsAndConditions from "./component/TermsAndConditions";

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