import { useEffect } from "react"; // Import useState
import { supabase } from "../config/supabase/supabaseClient"; // Adjust the import path as needed
import '../styling/output.css';

//components
import GuidesSidebar from "../components/sidebar/guides-sidebar";
import GuidesMain from "../components/main/guides-main";
import { ScrollArea } from "../components/ui/scroll-area"


function Guides() {  return (
    <div className="flex flex-1 max-w-full overflow-auto">
        <GuidesSidebar />
        <GuidesMain />
    </div>
  );
}

export default Guides;
