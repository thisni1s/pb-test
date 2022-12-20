import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PocketBase from 'pocketbase';
import Home from './pages/Home';
import Auth from './pages/Auth'
import { Navigate } from "react-router-dom";
import Profile from "./pages/Profile";

function App() {

  const pb = new PocketBase('https://base.jn2p.de');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthTest pb={pb} />} />
        <Route path="/home" element={<Home state={{pb: pb}} />} />
        <Route path="/auth" element={<Auth state={{pb: pb}} />} />
        <Route path="/profile" element={<Profile state={{pb: pb}} />} />
    </Routes>
  </BrowserRouter>
  );
}


export function AuthTest({ pb }) {
  return(
    <>
    {pb.authStore.isValid ? <Navigate to="/home" state={{pb: pb}}/> : <Navigate to="/auth" state={{pb: pb}}/>}
    </>
  )
}

export default App;
