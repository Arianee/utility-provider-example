import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Brandconnect from "./components/brandConnect/Brandconnect";
import PocST from "./components/pocst/PocST";
import POCSTForm from "./components/pocst/PocSTForm";


// Main App component with routing
function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Brandconnect />} />
          <Route path="/pocst/:arianeeParams" element={<PocST />} />
          <Route path="/pocst/form/:arianeeParams" element={<POCSTForm />} />
        </Routes>
      </BrowserRouter>
  );
}

export default App;
