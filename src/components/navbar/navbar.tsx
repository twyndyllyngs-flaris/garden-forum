import { useEffect } from "react"; // Import useState
import { supabase } from "../../config/supabase/supabaseClient"; // Adjust the import path as needed
import { Link, useNavigate } from "react-router-dom"; // Import from react-router-dom
import '../../styling/output.css';

//components
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Label } from "../ui/label"
import {
  Cloud,
  CreditCard,
  Github,
  Keyboard,
  LifeBuoy,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  PlusCircle,
  Settings,
  User,
  UserPlus,
  Users,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/drop-down"

function Navbar() {  
  const navigate = useNavigate();

  const handleLogout = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut(); // Call the Supabase signOut method
    if (error) {
      console.error("Logout error:", error.message);
    } else {
      navigate("/"); // Redirect to home page after successful logout
    }
  };
  
  return (
    <nav className="w-full h-16 min-h-16 flex justify-center items-center border-b border-gray-300 sticky top-0">
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
            to="/faq"
            className="hover:text-gray-700 px-3 py-2 rounded-md font-medium"
          >
            FaQ
          </Link>
        </div>

        {/* Profile */}
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {/* <Button variant="outline">Open</Button> */}
              <div className="flex justify-center items-center gap-3 cursor-pointer">
                <Label htmlFor="" className="text-md text-gray-700 cursor-pointer">Ralph Matthew De Leon</Label>
                <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
                  <User />
                  <div>Profile</div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer">
                  <Settings />
                  <span>Settings</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      </div>
    </nav>
  );
}

export default Navbar;
