import { useState } from 'react'
import { supabase } from '../../config/supabase/supabaseClient' // Adjust the import path as needed
import { Link, useNavigate } from 'react-router-dom' // Import from react-router-dom

// components
import { Button } from '../ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '../ui/tooltip'

export const description =
  "A login form with email and password. There's an option to login with Google and a link to sign up if you don't have an account."

export function LoginForm () {
  const navigate = useNavigate() // Create a navigate function

  const [email, setEmail] = useState('') // State for email
  const [password, setPassword] = useState('') // State for password
  const [error, setError] = useState('') // State for error message
  const [loading, setLoading] = useState(false) // Loading state

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault() // Prevent default form submission
    setLoading(true) // Set loading to true when login process starts
    setError('') // Clear any previous error

    try {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password
        })

      if (signInError) {
        if (signInError.message === 'Invalid login credentials') {
          setError('The email or password is incorrect. Please try again.')
        } else if (signInError.message === 'User not found') {
          setError('This email does not exist. Please sign up first.')
        } else {
          setError(signInError.message) // Generic error
        }
      } else {
        console.log('Login successful', data)
        // Redirect the user to the dashboard after successful login
        navigate('/guides')
      }
    } catch (err) {
      setError('An unexpected error occurred during login.')
      console.error('Login exception:', err)
    } finally {
      setLoading(false) // Ensure loading is set to false in all cases
    }
  }

  return (
    <Card className='mx-auto max-w-sm'>
      <CardHeader>
        <CardTitle className='text-2xl'>Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && <p className='text-red-500 mb-4'>{error}</p>}{' '}
        {/* Display error if present */}
        <form onSubmit={handleLogin}>
          {' '}
          {/* Add form onSubmit handler */}
          <div className='grid gap-4'>
            <div className='grid gap-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                placeholder='m@example.com'
                value={email} // Set email value
                onChange={e => setEmail(e.target.value)} // Update email state
                required
              />
            </div>
            <div className='grid gap-2'>
              <div className='flex items-center'>
                <Label htmlFor='password'>Password</Label>
                <Link
                  to='/'
                  className='ml-auto inline-block text-sm underline'
                >
                  Forgot your password?
                </Link>
              </div>
              <Input
                id='password'
                type='password'
                value={password} // Set password value
                onChange={e => setPassword(e.target.value)} // Update password state
                required
              />
            </div>
            <Button
              type='submit'
              className={`w-full ${
                loading ? 'bg-gray-400' : 'text-primary-foreground'
              }`}
              disabled={loading} // Disable the button while loading
            >
              {loading ? 'Loading...' : 'Login'}
            </Button>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant='outline' className='w-full' onClick={() => alert('This component is under development. Please sign-up via website.')}>
                    Login with Google
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This component is under development.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className='mt-4 text-center text-sm'>
            Don&apos;t have an account?{' '}
            <Link to='/signup' className='underline'>
              Sign up
            </Link>
          </div>
        </form>{' '}
        {/* End form */}
      </CardContent>
    </Card>
  )
}
