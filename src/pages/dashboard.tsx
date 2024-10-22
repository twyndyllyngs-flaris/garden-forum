import { useEffect } from "react"; // Import useState
import { supabase } from "../config/supabase/supabaseClient"; // Adjust the import path as needed
import '../styling/output.css';

//components
import Navbar from "../components/navbar/navbar";
import Guides from "./guides";

function Dashboard() {  return (
    <div className="flex flex-col w-screen h-screen">
        <Navbar />
        <Guides />
    </div>
  );
}

export default Dashboard;
