import { useState } from "react";
import { supabase } from "../config/supabase/supabaseClient";
import '../styling/output.css';

// Components
import GuidesSidebar from "../components/sidebar/guides-sidebar";
import GuidesMain from "../components/main/guides-main";

function Guides() {
    const [searchTerm, setSearchTerm] = useState(""); // State for search term

    return (
        <div className="flex flex-1 max-w-full overflow-auto">
            <GuidesSidebar setSearchTerm={setSearchTerm} />
            <GuidesMain searchTerm={searchTerm} />
        </div>
    );
}

export default Guides;
