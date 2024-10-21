import { useEffect } from "react"; // Import useState
import { supabase } from "../../config/supabase/supabaseClient"; // Adjust the import path as needed
import { Link, useNavigate } from "react-router-dom"; // Import from react-router-dom
import '../../styling/output.css';

//components
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Label } from "../ui/label"

function Navbar() {  return (
    <nav className="w-full h-20 flex justify-center items-center border-b border-gray-300">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo or Branding */}
        <div className="text-2xl font-bold">
          <Link to="/">GardenForum</Link>
        </div>

        {/* Navbar links */}
        <div className="flex space-x-4 text-md text-gray-500">
          <Link
            to="/guides"
            className="hover:text-gray-700 px-3 py-2 rounded-md font-medium text-gray-700"
          >
            Guides
          </Link>
          <Link
            to="/forum"
            className="hover:text-gray-700 px-3 py-2 rounded-md font-medium"
          >
            Forum
          </Link>
          <Link
            to="/profiles"
            className="hover:text-gray-700 px-3 py-2 rounded-md font-medium"
          >
            FaQ
          </Link>
        </div>

        {/* Profile */}
        <div className="flex justify-center items-center gap-3">
            <Label htmlFor="" className="text-md text-gray-700">Ralph Matthew De Leon</Label>
            <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
            </Avatar>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;
