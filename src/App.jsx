import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import NavBar from "./Pages/NavBar";
import Footer from "./Components/Footer";
import { useAuthStore } from "@/Stores/authStore.js";


const App = () => {
  const initAuth = useAuthStore((s) => s.init);
  useEffect(() => {
    initAuth();
  }, [initAuth]);
  return (
    <div className="main relative">
      <NavBar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default App;
