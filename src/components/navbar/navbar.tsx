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
import Badge from '@mui/material/Badge';
import MailIcon from '@mui/icons-material/Mail';
import IconButton from '@mui/material/IconButton';

//libraries
import { formatDistanceToNow } from 'date-fns';

type NotificationPayload = {
  notification_id: string;
  recipient_id: string;
  sender_id: string | null;
  type: string;
  message: string;
  read: boolean;
  created_at: string;
  forum_id: string | null;
  plant_id: string | null;
  comment_id: string | null;
};

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null); // Set user type to User or null
  const [loading, setLoading] = useState(true); // Loading state

  // for notifications
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

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

  useEffect(() => {
    if (!user) return;

    // Set up the real-time subscription using `channel`
    const notificationChannel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `recipient_id=eq.${user.id}` },
        (payload) => {
          console.log('Notification payload received:', payload);

          if (payload?.new) {
            // Map payload to NotificationPayload safely
            const mappedNotification: NotificationPayload = {
              notification_id: payload.new.notification_id ?? '',
              recipient_id: payload.new.recipient_id ?? '',
              sender_id: payload.new.sender_id ?? null,
              type: payload.new.type ?? '',
              message: payload.new.message ?? '',
              read: payload.new.read ?? false,
              created_at: payload.new.created_at ?? new Date().toISOString(),
              forum_id: payload.new.forum_id ?? null,
              plant_id: payload.new.plant_id ?? null,
              comment_id: payload.new.comment_id ?? null,
            };

            setNotifications((prev) => [mappedNotification, ...prev]);
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      // Clean up the subscription when user is logged out or component unmounts
      supabase.removeChannel(notificationChannel);
    };
  }, [user]);

  // Fetch initial notifications for logged-in user
  useEffect(() => {
    if (!user?.id) return;

    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('recipient_id', user?.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching initial notifications:', error);
        } else {
          setNotifications(data || []);
          setUnreadCount((data || []).filter(n => !n.read).length);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    };

    fetchNotifications();
  }, [user?.id]);

  // Example: Display time in a relative way
  const timeAgo = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  const test = async () => {
    console.log(notifications)
  }

  const handleLogout = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error.message);
    } else {
      setUser(null); // Clear user on successful logout
      navigate("/"); // Redirect to home page
    }
  };

  const handleReadNotif = async (notification_id: string) => {
    try {
      // Update the `read` status in the database
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("notification_id", notification_id);

      if (error) {
        console.error("Error updating notification read status:", error.message);
        return;
      }

      console.log(`Notification ${notification_id} marked as read`);

      // Update local state for instant UI feedback
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.notification_id === notification_id
            ? { ...notif, read: true }
            : notif
        )
      );
    } catch (err) {
      console.error("Unexpected error in handleReadNotif:", err);
    } finally {
      setUnreadCount((prevCount) => prevCount - 1)
    }
  }

  const navigateNotifaction = async (notification: NotificationPayload) => {
    console.log(notification)
    if (!notification) return;

    if (notification.type === "System1") {
      console.log(notification.message)
    } else if (notification.type === "upvote") {
      navigate(`/forum/${notification.forum_id}`)
    } else if (notification.type === "comment") {
      navigate(`/forum/${notification.forum_id}?comment_id=${notification.comment_id}`);
    }

    if (!notification.read)
      handleReadNotif(notification.notification_id)
  }

  return (
    <nav className="w-full h-16 min-h-16 flex justify-center items-center border-b border-gray-300 sticky top-0 z-10 bg-white">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo or Branding */}
        <div className="text-2xl font-bold">
          <Link to="/guides">GardenForum</Link>
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex justify-center items-center gap-3 cursor-pointer">
                <IconButton>
                  <Badge badgeContent={unreadCount} color="primary">
                    <MailIcon />
                  </Badge>
                </IconButton>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-fit max-w-[300px] max-h-[600px] overflow-auto relative pt-0">

              <DropdownMenuLabel className="sticky top-0 bg-white z-10 border-b-[1px] border-gray-200 mb-1" onClick={test}>
                {notifications.length === 0 ? "Your notifaction will show here" : "Notifications"}
              </DropdownMenuLabel>

              <DropdownMenuGroup className="flex flex-col gap-2">
                {notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.notification_id} // Use a unique key for React rendering
                    onClick={() => navigateNotifaction(notification)}
                    className={`${notification.read ? "" : "bg-gray-100"} cursor-pointer flex flex-col items-start focus:bg-gray-200`}
                  >
                    <div className="flex justify-center gap-3 cursor-pointer">
                      <Avatar className="">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>CN</AvatarFallback>
                      </Avatar>
                      <div className="break-words">
                        {notification.message}
                      </div>
                    </div>
                    <div className="ml-[3.2rem] font-semibold">
                      {timeAgo(notification.created_at)} {/* Display the relative time */}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
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
              <div className="flex justify-center items-center gap-3 cursor-pointer" >
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
                <DropdownMenuItem onClick={() => navigate(`/profile/${user.id}`)} className="cursor-pointer">
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
