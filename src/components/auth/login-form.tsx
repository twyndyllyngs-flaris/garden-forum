import { Link, useNavigate } from "react-router-dom"; // Import from react-router-dom
import { useState } from "react"; // Import useState
import { supabase } from "../../config/supabase/supabaseClient"; // Adjust the import path as needed

import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export const description =
  "A login form with email and password. There's an option to login with Google and a link to sign up if you don't have an account.";

export function LoginForm() {
  const navigate = useNavigate(); // Create a navigate function

  const [email, setEmail] = useState(""); // State for email
  const [password, setPassword] = useState(""); // State for password

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent the default form submission

    // const { error } = await supabase.auth.signInWithPassword({
    //   email,
    //   password,
    // });

    // if (error) {
    //   console.error("Login error:", error.message);
    //   return;
    // }

    // navigate("/signup")

    checkUserSession()
  };

  const checkUserSession = async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error("Error fetching user:", error.message);
      return;
    }

    if (data) {
      console.log("User is signed in:", data.user);
      // You can now access user information
    } else {
      console.log("User is signed out");
      // Handle the signed-out state (e.g., redirect to login)
    }
  };

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin}> {/* Add form onSubmit handler */}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email} // Set email value
                onChange={(e) => setEmail(e.target.value)} // Update email state
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="ml-auto inline-block text-sm underline">
                  Forgot your password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password} // Set password value
                onChange={(e) => setPassword(e.target.value)} // Update password state
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
            <Button variant="outline" className="w-full">
              Login with Google
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </form> {/* End form */}
      </CardContent>
    </Card>
  );
}
