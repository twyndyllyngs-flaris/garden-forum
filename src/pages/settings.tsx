import { useEffect, useState, useRef } from 'react' // Import useState
import { supabase } from '../config/supabase/supabaseClient' // Adjust the import path as needed
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import Cropper, { ReactCropperElement } from 'react-cropper'
import 'cropperjs/dist/cropper.css'
import '../styling/output.css'

//components
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Label } from '../components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogOverlay
} from '../components/ui/alert-dialog'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/text-area'
import { Separator } from '../components/ui/seperator'
import { Button } from '../components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../components/ui/drop-down'
import { Switch } from '../components/ui/switch'
import { profile } from 'console'

// interfaces
interface FormValues {
  bio: string
  email: string
  username: string
  firstname: string
  lastname: string
  show_upvoted: boolean
}

interface AlertDialogContent {
  title: string
  content: string
  buttonText: string
  action: () => Promise<void>
  cancel: () => void
}

function Settings () {
  const location = useLocation()
  const navigate = useNavigate()
  const [loggedInUser, setLoggedInUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)

  const [charCount, setCharCount] = useState(0)
  const [isDialogOpen, setDialog] = useState(false)
  const [dialogContent, setDialogContent] = useState<AlertDialogContent>({
    title: 'Are you sure?',
    content:
      'This action cannot be undone. This will permanently delete your data and remove it from our servers.',
    buttonText: 'Delete',
    action: async () => {
      return
    },
    cancel: () => {
      return
    }
  })

  const [isCropDialogOpen, setCropDialogOpen] = useState(false) // To control the cropping popup
  const [image, setImage] = useState<string | null>(null) // Chosen image for cropping
  const [croppedImage, setCroppedImage] = useState<string | null>(null) // Final cropped image
  // Explicitly cast the ref to match ReactCropperElement
  const cropperRef = useRef<ReactCropperElement>(null)

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    reset,
    control,
    formState: { isSubmitting, errors }
  } = useForm<FormValues>({
    defaultValues: {
      show_upvoted: false // Set the default value for the switch
    }
  })

  const currentValues = useWatch({ control }) // Watch all form values
  const [isFormChanged, setIsFormChanged] = useState(false)

  // Check for changes and update `isFormChanged`
  useEffect(() => {
    if (!userProfile) return

    const userProfileReduced = {
      firstname: userProfile.first_name,
      lastname: userProfile.last_name,
      username: userProfile.username,
      bio: userProfile.bio,
      show_upvoted: userProfile.show_upvoted
    }

    setIsFormChanged(
      JSON.stringify(currentValues) !== JSON.stringify(userProfileReduced)
    )
  }, [currentValues, userProfile])

  useEffect(() => {
    if (!userProfile) return

    setValue('show_upvoted', userProfile.show_upvoted)
  }, [setValue, userProfile]) // Trigger the effect when the component mounts

  // Handle file input change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        if (reader.result) {
          setImage(reader.result as string) // Set the selected image
          setCropDialogOpen(true) // Open the cropping dialog
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCrop = async () => {
    if (cropperRef.current && cropperRef.current.cropper) {
      const cropperInstance = cropperRef.current.cropper // Access the Cropper.js instance
      const canvas = cropperInstance.getCroppedCanvas() // Use the Cropper.js method

      if (canvas) {
        // Convert the cropped canvas to a data URL
        const croppedImageDataURL = canvas.toDataURL('image/jpeg') // Ensure the image is in JPEG format

        // Convert the data URL to a Blob
        const response = await fetch(croppedImageDataURL)
        const blob = await response.blob()

        // Get the current user UID
        const uid = loggedInUser.id

        // Create a path for the uploaded image
        const filePath = `${uid}/img.jpg` // Path to store the image under the user's UID

        try {
          // Upload the image to Supabase Storage
          const { data, error } = await supabase.storage
            .from('profile_pictures') // Your bucket name
            .upload(filePath, blob, { upsert: true })

          if (error) throw error

          console.log('Profile picture uploaded successfully')

          // Get the public URL of the uploaded image
          const { data: publicUrlData } = supabase.storage
            .from('profile_pictures')
            .getPublicUrl(filePath)

          if (!publicUrlData || !publicUrlData.publicUrl) {
            throw new Error('Failed to retrieve public URL')
          }

          const publicURL = publicUrlData.publicUrl // Correct structure

          // Append a timestamp or unique parameter to prevent caching
          const cacheBustedURL = `${publicURL}?t=${new Date().getTime()}` // Adding timestamp query parameter

          // Update the profile_link in the profiles table
          const { data: profileData, error: updateError } = await supabase
            .from('profiles')
            .upsert(
              {
                uid, // Using uid to match the user record in profiles table
                profile_link: cacheBustedURL // Set the URL to the profile_link field
              },
              { onConflict: 'uid' } // Ensure update if record exists, insert if not
            )

          if (updateError) throw updateError

          console.log('Profile link updated successfully in profiles table')

          // Optionally, close the dialog or update UI
          setCroppedImage(cacheBustedURL)
          setCropDialogOpen(false)
        } catch (uploadError) {
          console.error('Error uploading profile picture:', uploadError)
        } finally {
          window.location.reload()
        }
      }
    }
  }

  const onSubmit = async (data: FormValues) => {
    const setDialogContentData = async () => {
      setDialogContent({
        title: 'Confirm update',
        content:
          'Proceed on updating your details? your info reflects on how other users see you',
        buttonText: 'Update',
        action: async () => updateUserDetails(data),
        cancel: () => {
          setDialog(false)
        }
      })
    }

    await setDialogContentData()
    setDialog(true)
  }

  const updateUserDetails = async (data: FormValues) => {
    // Check if the username has changed
    if (data.username !== userProfile?.username) {
      // If the username has changed, check if it's already taken
      const { data: existingUsernames, error: usernameError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', data.username) // Look for matching username
        .neq('uid', userProfile?.uid) // Exclude current user by UID

      if (usernameError) {
        console.error('Error checking username:', usernameError.message)
        return
      }

      if (existingUsernames?.length > 0) {
        // Display an error if the username is already taken
        setError('username', {
          type: 'manual',
          message: 'Username is already taken'
        })
        return
      }
    }

    // Map form data to database fields
    const profileUpdate = {
      first_name: data.firstname,
      last_name: data.lastname,
      username: data.username,
      bio: data.bio,
      show_upvoted: data.show_upvoted
    }

    try {
      // Ensure `userProfile` contains the required `uid`
      if (!userProfile?.uid) {
        console.error('User ID is not available.')
        return
      }

      const { error } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('uid', userProfile.uid) // Match the user's record by UID

      if (error) {
        console.error('Error updating profile:', error.message)
      } else {
        console.log('Profile updated successfully!')
      }
    } catch (err) {
      console.error('Unexpected error updating profile:', err)
    } finally {
      window.location.reload()
    }
  }

  const handleCharCount = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setValue('bio', value) // Update React Hook Form's state
    setCharCount(value.length) // Update character count
  }

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser()
      if(!user){
        navigate('/')
      }
      setLoggedInUser(user)
    }

    getUser()
  }, [])

  useEffect(() => {
    const getUserProfile = async () => {
      if (loggedInUser) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .eq('uid', loggedInUser.id)

        if (profilesError) throw profilesError

        setUserProfile(profiles[0])

        reset({
          firstname: profiles[0].first_name || '',
          lastname: profiles[0].last_name || '',
          username: profiles[0].username || '',
          bio: profiles[0].bio || '',
          show_upvoted: profiles[0].show_upvoted || false
        })

        setCroppedImage(profiles[0].profile_link)
      }
    }

    getUserProfile()
  }, [loggedInUser])

  const getInitials = (firstName: string, lastName: string): string => {
    if (!firstName || !lastName) return '' // Ensure both names are provided

    // Process first name: take the first letter of each word in the first name
    const firstInitials = firstName
      .split(' ')
      .filter(Boolean) // Remove extra spaces
      .map(part => part.charAt(0).toUpperCase()) // Take the first letter of each part
      .join('') // Combine into a string

    // Process last name: take the first letter of each word in the last name
    const lastInitials = lastName
      .split(' ')
      .filter(Boolean) // Remove extra spaces
      .map(part => part.charAt(0).toUpperCase()) // Take the first letter of each part
      .join('') // Combine into a string

    return firstInitials + lastInitials
  }

  const handleLogout = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Logout error:', error.message)
    } else {
      setLoggedInUser(null) // Clear user on successful logout
      setUserProfile(null)
      navigate('/') // Redirect to home page
    }
  }

  const handleLogoutButton = async () => {
    const setDialogContentData = async () => {
      setDialogContent({
        title: 'Confirm Sign-out',
        content: 'You will be sign-out of the application',
        buttonText: 'Sign-out',
        action: handleLogout,
        cancel: () => {
          setDialog(false)
        }
      })
    }

    await setDialogContentData()
    setDialog(true)
  }

  return (
    <div className='flex m-auto h-full relative overflow-auto justify-center'>
      <div className='min-h-full min-w-[700px] p-6 flex flex-col gap-6 h-fit border-r border-l'>
        <h1 className='text-lg text-gray-700 font-bold'> Edit Profile </h1>

        <div className='bg-gray-100 p-5 rounded-lg flex items-center gap-4'>
          <div className='w-28 h-28'>
            <Avatar className='h-full w-full flex items-center justify-center relative'>
              {/* Overlay to trigger file selection */}
              <div
                className='absolute inset-0 bg-black hover:opacity-50 opacity-0 transition-all flex justify-center items-center text-white cursor-pointer'
                onClick={() => document.getElementById('file-input')?.click()}
              >
                Change Photo
              </div>

              {/* Avatar Image */}
              <AvatarImage src={croppedImage || ''} alt='User Avatar' />
              <AvatarFallback className='bg-red-200 text-lg font-bold text-gray-700'>
                {userProfile
                  ? getInitials(userProfile.first_name, userProfile.last_name)
                  : 'USER'}
              </AvatarFallback>
            </Avatar>

            {/* Hidden File Input */}
            <input
              id='file-input'
              type='file'
              accept='image/*'
              className='hidden'
              onChange={handleFileChange}
            />

            {/* Cropping AlertDialog */}
            <AlertDialog
              open={isCropDialogOpen}
              onOpenChange={setCropDialogOpen}
            >
              <AlertDialogContent className='min-w-[600px] min-h-[600px] h-[600px] w-[600px]'>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Crop Your Image{' '}
                    <span className='text-gray-600 text-sm'>
                      (Scroll to zoom in/out)
                    </span>
                  </AlertDialogTitle>
                </AlertDialogHeader>
                <div className='w-full h-full max-w-[700px] max-h-[400px]'>
                  {image && (
                    <Cropper
                      src={image}
                      style={{ height: '100%', width: '100%' }}
                      aspectRatio={1} // Square cropping area for circular crop
                      guides={true}
                      viewMode={1} // Cropping area is visible and fixed
                      ref={cropperRef}
                      cropBoxResizable={false} // Disable resizing the crop box
                    />
                  )}
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    className='px-4 py-2 bg-gray-500 text-white hover:text-white rounded hover:bg-gray-600'
                    onClick={() => setCropDialogOpen(false)}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <Button onClick={handleCrop}>Save</Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className='flex flex-col'>
            <Label
              htmlFor='avatar'
              className='text-md text-gray-700 cursor-pointer font-semibold'
            >
              {loggedInUser ? loggedInUser.user_metadata.displayName : 'User'}
            </Label>
            <Label
              htmlFor='avatar'
              className='text-md text-gray-500 cursor-pointer'
            >
              {userProfile ? userProfile.username : 'Username'}
            </Label>
          </div>

          <Button className='ml-auto' onClick={handleLogoutButton}>
            Sign-out
          </Button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className='w-full flex flex-col gap-4'
        >
          <div className='grid w-full items-center gap-1.5'>
            <Label htmlFor='bio' className='text-gray-700 font-semibold'>
              Bio
            </Label>
            <div className='relative'>
              <Textarea
                {...register('bio', {
                  // required: 'Bio is required',
                  maxLength: { value: 150, message: 'Max of 150 characters' }
                  // minLength: { value: 2, message: 'Min of 2 characters' }
                })}
                className='h-16'
                id='bio'
                placeholder='Type your Bio here'
                onChange={handleCharCount} // Update character count on change
              />
              <p className='text-gray-500 text-sm absolute z-20 bottom-3 right-3'>
                {charCount}/150
              </p>{' '}
              {/* Display character count */}
            </div>
            {errors.bio && (
              <p className='text-red-500 text-sm'>{errors.bio.message}</p>
            )}
          </div>

          {/* <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="email" className="text-gray-700 text-md font-semibold">Email</Label>
                        <Input
                            {...register("email", {
                                required: "Email is required", // Custom error message for required
                                pattern: {
                                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                                    message: "Please enter a valid email address", // Custom error message for invalid email pattern
                                },
                            })}
                            className="h-16"
                            type="email"
                            id="email"
                            placeholder="Email"
                        />
                    
                        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                    </div> */}

          {/* // Form input for username */}
          <div className='grid w-full items-center gap-1.5'>
            <Label
              htmlFor='username'
              className='text-gray-700 text-md font-semibold'
            >
              Username
            </Label>
            <Input
              {...register('username', {
                required: 'Username is required',
                minLength: {
                  value: 3,
                  message: 'Username must be at least 3 characters long'
                },
                validate: async value => {
                  // Check if username is unique when it's changed
                  if (value !== userProfile?.username) {
                    const { data: existingUsernames, error } = await supabase
                      .from('profiles')
                      .select('username')
                      .eq('username', value) // Check for existing username
                      .neq('uid', userProfile?.uid) // Exclude current user
                    if (error) {
                      console.error('Error checking username:', error.message)
                      return 'Error checking username availability'
                    }
                    if (existingUsernames?.length > 0) {
                      return 'Username is already taken'
                    }
                  }
                  return true
                }
              })}
              className='h-16'
              type='text'
              id='username'
              placeholder='Username'
            />
            {errors.username && (
              <p className='text-red-500 text-sm'>{errors.username.message}</p>
            )}
          </div>

          <div className='flex flex-col gap-3'>
            <div className='flex gap-3'>
              <div className='grid w-full items-center gap-1.5'>
                <Label
                  htmlFor='firstname'
                  className='text-gray-700 text-md font-semibold'
                >
                  First Name
                </Label>
                <Input
                  {...register('firstname', {
                    required: 'First Name is required', // Custom error message for required
                    minLength: {
                      value: 2,
                      message: 'Firstname must be at least 2 characters' // Minimum length validation
                    },
                    maxLength: {
                      value: 14,
                      message: 'Firstname must be 14 characters at max' // Minimum length validation
                    }
                  })}
                  className='h-16'
                  type='text'
                  id='firstname'
                  placeholder='First Name'
                />
              </div>

              <div className='grid w-full items-center gap-1.5'>
                <Label
                  htmlFor='lastname'
                  className='text-gray-700 text-md font-semibold'
                >
                  Last Name
                </Label>
                <Input
                  {...register('lastname', {
                    required: 'Last Name is required', // Custom error message for required
                    minLength: {
                      value: 2,
                      message: 'Lastname must be at least 2 characters' // Minimum length validation
                    },
                    maxLength: {
                      value: 14,
                      message: 'Lastname must be 14 characters at max' // Minimum length validation
                    }
                  })}
                  className='h-16'
                  type='text'
                  id='lastname'
                  placeholder='Last Name'
                />
              </div>
            </div>
            {/* Error message display */}
            {errors.firstname && (
              <p className='text-red-500 text-sm'>{errors.firstname.message}</p>
            )}
            {errors.lastname && (
              <p className='text-red-500 text-sm'>{errors.lastname.message}</p>
            )}
          </div>

          <div className='flex w-full items-center border p-4 rounded-2xl h-16'>
            <Label
              htmlFor='show_upvoted'
              className='text-gray-700 text-md font-semibold cursor-pointer'
            >
              Show upvoted posts
            </Label>
            <Switch
              {...register('show_upvoted')}
              id='show_upvoted'
              className='ml-auto'
              checked={currentValues?.show_upvoted} // Use the watched value from form state
              onCheckedChange={checked => setValue('show_upvoted', checked)}
            />
          </div>
          <Button
            type='submit'
            className='w-fit ml-auto h-12'
            disabled={!isFormChanged}
          >
            {isSubmitting ? (
              <div className='spinner-border animate-spin w-5 h-5 border-4 border-solid border-gray-200 border-t-blue-600 rounded-full'></div> // Replace with your spinner
            ) : (
              'Submit Changes'
            )}
          </Button>
        </form>
      </div>

      <AlertDialog open={isDialogOpen}>
        <AlertDialogOverlay className='bg-transparent' />{' '}
        {/* Customize the overlay */}
        <AlertDialogContent className='z-[9999]'>
          <AlertDialogHeader>
            <AlertDialogTitle> {dialogContent.title} </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogContent.content}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={dialogContent.cancel}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={dialogContent.action}>
              {dialogContent.buttonText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default Settings
