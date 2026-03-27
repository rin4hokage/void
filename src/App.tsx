import AdminCode from "./pages/AdminCode";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import About from "./pages/About";
import Artwork from "./pages/Artwork";
import Checkout from "./pages/Checkout";
import Contact from "./pages/Contact";
import Drumkits from "./pages/Drumkits";
import Index from "./pages/Index";
import Loops from "./pages/Loops";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/about" element={<About />} />
      <Route path="/artwork" element={<Artwork />} />
      <Route path="/drumkits" element={<Drumkits />} />
      <Route path="/loops" element={<Loops />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/admin-code" element={<AdminCode />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;
