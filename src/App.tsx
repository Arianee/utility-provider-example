import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Brandconnect from "./components/brandConnect/Brandconnect";
import PocST from "./components/pocst/PocST";


// Main App component with routing
function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Brandconnect />} />
          <Route path="/pocst/:arianeeParams" element={<PocST />} />
        </Routes>
      </BrowserRouter>
  );
}

export default App;
