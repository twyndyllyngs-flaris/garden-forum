import { useEffect } from "react"; // Import useState
import { supabase } from "../config/supabase/supabaseClient"; // Adjust the import path as needed
import { Link, useNavigate } from "react-router-dom"; // Import from react-router-dom
import '../styling/output.css';
import "non.geist"

//components
import Navbar from "../components/navbar/navbar";
import Guides from "./guides";

function Profile() {  
    const navigate = useNavigate();

    return (
        <div className="flex flex-col justify-center items-center w-screen h-screen">
            <h2> Profile/Settings page is currently on production. </h2>
            <h2> click <Link to={"/guides"} className="text-blue-500"> here </Link> to go back. </h2>
        </div>
    );
}

export default Profile;
