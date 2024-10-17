import { useEffect } from "react"; // Import useState
import { supabase } from "../config/supabase/supabaseClient"; // Adjust the import path as needed
import '../styling/output.css';

// components
import { LoginForm } from '../components/auth/login-form';

function Login() {

  // logs out user from supabase
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        // User is signed in, sign them out
        await supabase.auth.signOut();
      }
    };

    checkSession();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
        <LoginForm />
    </div>
  );
}

export default Login;
