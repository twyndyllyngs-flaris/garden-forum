import { useState } from "react";
import { supabase } from "../config/supabase/supabaseClient";
import '../styling/output.css';

// Components
import GuidesSidebar from "../components/sidebar/guides-sidebar";
import GuidesMain from "../components/main/guides-main";

function Guides() {
    const [searchTerm, setSearchTerm] = useState(""); // State for search term
    const [sortBy, setSortBy] = useState<"name" | "category">("name"); // State for sorting
    const [isAscending, setIsAscending] = useState(true); // State for sort order

    return (
        <div className="flex flex-1 max-w-full overflow-auto h-full">
            <GuidesSidebar 
                setSearchTerm={setSearchTerm} 
                setSortBy={setSortBy} 
                setIsAscending={setIsAscending} // Pass the setIsAscending function
            />
            <GuidesMain 
                searchTerm={searchTerm} 
                sortBy={sortBy} 
                isAscending={isAscending} // Pass isAscending state
            />
        </div>
    );
}

export default Guides;
