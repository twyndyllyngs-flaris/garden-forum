import { useEffect } from "react"; // Import useState
import { supabase } from "../config/supabase/supabaseClient"; // Adjust the import path as needed
import { Link, useLocation, useNavigate } from "react-router-dom";
import '../styling/output.css';

//components

function Settings() {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <div className="flex-1 w-full h-full flex justify-center items-center">
            <div className="w-[500px] h-fit text-wrap">
                This page is still under development. Click
                <span
                    className="text-blue-500 font-bold cursor-pointer mx-1"
                    onClick={() => navigate(-1)}
                >
                    Here
                </span>
                to go back.
            </div>
        </div>

    );
}

export default Settings;
