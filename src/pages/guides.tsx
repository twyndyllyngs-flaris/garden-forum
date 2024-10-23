import { useEffect } from "react"; // Import useState
import { supabase } from "../config/supabase/supabaseClient"; // Adjust the import path as needed
import '../styling/output.css';

//components
import GuidesSidebar from "../components/sidebar/guides-sidebar";
import GuidesMain from "../components/main/guides-main";

function Guides() {  return (
    <div className="w-full h-full flex">
        <GuidesSidebar />
        <GuidesMain />
    </div>
  );
}

export default Guides;
