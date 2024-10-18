// essentials
import { useState } from "react";
import { supabase } from "../../config/supabase/supabaseClient"; // Adjust the import path as needed
import { Link, useNavigate } from "react-router-dom"; // Import from react-router-dom

// components
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog"



export const description =
  "A sign-up form with first name, last name, email, and password inside a card. There's an option to sign up with GitHub and a link to login if you already have an account.";

export function SignupForm() {
  const navigate = useNavigate(); // Create a navigate function

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
  const [dialog, setDialog] = useState(false)

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true); // Set loading to true when the signup process starts
    setError(""); // Clear any previous errors
  
    try {
      // Check if the email is confirmed
      const { data: isConfirmed, error: emailCheckError } = await supabase
        .rpc('is_email_confirmed', { email });
  
      if (emailCheckError) {
        console.error('Error checking email status:', emailCheckError);
        setError('An error occurred while checking the email status.');
        return;
      }
  
      // Check the email status
      if (isConfirmed === false) {
        setError('Please confirm your email before signing up.');
        return; // Prevent signup if the email is not confirmed
      } else if (isConfirmed === true) {
        setError('Email is already registered. Please use a different email.');
        return; // Prevent signup if the email is already confirmed
      }
  
      // Proceed with the signup
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            displayName: `${firstName} ${lastName}`, // Store full name in Supabase Auth
            providerType: "password",
            first_name: firstName, // Store first name in metadata
            last_name: lastName,   // Store last name in metadata
          },
        },
      });
  
      // Check if sign up was successful
      if (signUpError) {
        setError(signUpError.message);
        return; // Return early if there was an error
      }
  
      console.log(data);
  
      // Notify user to check their email for confirmation
      setDialog(true);
    } catch (error) {
      setError("An error occurred during the signup process.");
      console.error("Signup Error: ", error);
    } finally {
      setLoading(false); // Ensure loading is set to false in all cases
    }
  };
  
  
  const handleLoginRedirect = () => {
    navigate("/");
  };

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Sign Up</CardTitle>
        <CardDescription>
          Enter your information to create an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && <p className="text-red-500">{error}</p>} {/* Display error messages */}
        <form onSubmit={handleSignup}>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first-name">First name</Label>
                <Input
                  id="first-name"
                  placeholder="Max"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name">Last name</Label>
                <Input
                  id="last-name"
                  placeholder="Robinson"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className={`w-full ${loading ? "bg-gray-400" : "text-primary-foreground"}`} 
              disabled={loading} // Disable the button while loading
            >
              {loading ? "Loading..." : "Create an account"}
            </Button>

            <AlertDialog open={dialog}>
              <AlertDialogContent >
                <AlertDialogHeader>
                  <AlertDialogTitle>Account created!</AlertDialogTitle>
                  <AlertDialogDescription>
                    To finalize, please check email for confirmation.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Stay</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLoginRedirect}>Go to Login</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button variant="outline" className="w-full">
              Sign up with GitHub
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to="/" className="underline">
              Sign in
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}