import { useEffect } from "react"; // Import useState
import { supabase } from "../config/supabase/supabaseClient"; // Adjust the import path as needed
import '../styling/output.css';

//components
import GuidesSidebar from "../components/sidebar/guides-sidebar";

function Guides() {  return (
    <div className="w-full h-full">
        <GuidesSidebar />
    </div>
  );
}

export default Guides;
