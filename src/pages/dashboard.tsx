import { useEffect } from "react"; // Import useState
import { supabase } from "../config/supabase/supabaseClient"; // Adjust the import path as needed
import '../styling/output.css';

//components
import Navbar from "../components/navbar/navbar";

function Dashboard() {  return (
    <div className="flex items-start justify-center min-h-screen">
        <Navbar />
    </div>
  );
}

export default Dashboard;
