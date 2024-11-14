import { useEffect } from "react"; // Import useState
import { supabase } from "../config/supabase/supabaseClient"; // Adjust the import path as needed
import { useLocation } from "react-router-dom";
import '../styling/output.css';

//components
import Navbar from "../components/navbar/navbar";
import Guides from "./guides";
import Forum from "./forum";

function Dashboard() {
  const location = useLocation();

  return (
    <div className="flex flex-col w-screen h-screen">
      <Navbar />

      <div className="flex-1 w-full h-full">
        {location.pathname.startsWith("/guides") && <Guides />}
        {location.pathname === "/forum" && <Forum />}
      </div>
    </div>
  );
}

export default Dashboard;
