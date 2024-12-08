import { useEffect, useState } from "react";
import { supabase } from "../../config/supabase/supabaseClient";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { User } from "@supabase/supabase-js"; // Import the User type
import '../../styling/output.css';

// Components
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Label } from "../ui/label";
import {
  LogOut,
  Settings,
  User as UserIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/drop-down";
import { Button } from "../ui/button"; // Import ShadCN Button

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null); // Set user type to User or null
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    // Check if user is logged in on component mount
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user); // user can be either User object or null
      setLoading(false); // Set loading to false after fetching
    };

    fetchUser();

    // Set up a listener to detect changes in authentication state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setLoading(false); // Update loading state
    });

    // Clean up the listener on component unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error.message);
    } else {
      setUser(null); // Clear user on successful logout
      navigate("/"); // Redirect to home page
    }
  };

  return (
    <nav className="w-full h-16 min-h-16 flex justify-center items-center border-b border-gray-300 sticky top-0 z-10 bg-white">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo or Branding */}
        <div className="text-2xl font-bold">
          <Link to="/">GardenForum</Link>
        </div>

        {/* Navbar links */}
        <div className="flex space-x-4 text-md text-gray-500">
          <Link
            to="/guides"
            className={`hover:text-gray-700 px-3 py-2 rounded-md font-medium ${location.pathname === "/guides" ? "text-gray-700" : ""}`}
          >
            Guides
          </Link>
          <Link
            to="/forum"
            className={`hover:text-gray-700 px-3 py-2 rounded-md font-medium ${location.pathname === "/forum" ? "text-gray-700" : ""}`}
          >
            Forum
          </Link>
          <Link
            to="/faq"
            className={`hover:text-gray-700 px-3 py-2 rounded-md font-medium ${location.pathname === "/faq" ? "text-gray-700" : ""}`}
          >
            FAQ
          </Link>
        </div>

        {/* Profile or Loading Avatar */}
        {loading ? (
          <div className="flex justify-center items-center gap-3 cursor-pointer">
            <Label htmlFor="" className="text-md text-gray-700 cursor-pointer">
              user
            </Label>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex justify-center items-center gap-3 cursor-pointer">
                <Label htmlFor="" className="text-md text-gray-700 cursor-pointer">
                  {user.user_metadata.displayName || "User"}
                </Label>
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
                  <UserIcon />
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
        ) : (
          <Button
            onClick={() => navigate("/login")}
            variant="default"
          >
            Sign In
          </Button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
