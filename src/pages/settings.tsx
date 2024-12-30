import { useEffect, useState } from "react"; // Import useState
import { supabase } from "../config/supabase/supabaseClient"; // Adjust the import path as needed
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import '../styling/output.css';

//components
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Label } from "../components/ui/label";
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
    AlertDialogOverlay,
} from "../components/ui/alert-dialog"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/text-area"
import { Separator } from "../components/ui/seperator";
import { Button } from "../components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../components/ui/drop-down";
import { Switch } from "../components/ui/switch"
import { profile } from "console";

// interfaces
interface FormValues {
    bio: string;
    email: string;
    username: string;
    firstname: string;
    lastname: string;
    showupvote: boolean;
}

interface AlertDialogContent {
    title: string,
    content: string,
    buttonText: string,
    action: () => Promise<void>,
    cancel: () => void,
}

function Settings() {
    const location = useLocation();
    const navigate = useNavigate();
    const [loggedInUser, setLoggedInUser] = useState<any>(null)
    const [userProfile, setUserProfile] = useState<any>(null)

    const [charCount, setCharCount] = useState(0);
    const [isDialogOpen, setDialog] = useState(false);
    const [dialogContent, setDialogContent] = useState<AlertDialogContent>({
        title: "Are you sure?",
        content: "This action cannot be undone. This will permanently delete your data and remove it from our servers.",
        buttonText: "Delete",
        action: async () => { return },
        cancel: () => { return },
    })

    const { register, handleSubmit, setValue, reset, formState: { isSubmitting, errors } } = useForm<FormValues>({
        defaultValues: { showupvote: true }, // Default state is false
    });

    const onSubmit = (data: FormValues) => {
        console.log(data);
    };

    // Handle character count update
    const handleCharCount = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCharCount(e.target.value.length);
    };

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setLoggedInUser(user)
        }

        getUser()
    }, [])

    useEffect(() => {
        const getUserProfile = async () => {
            if (loggedInUser) {
                const { data: profiles, error: profilesError } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("uid", loggedInUser.id);

                if (profilesError) throw profilesError;

                setUserProfile(profiles[0])

                reset({
                    firstname: profiles[0].first_name || "",
                    lastname: profiles[0].last_name || "",
                    username: profiles[0].username || "",
                    bio: profiles[0].bio || "",
                    showupvote: loggedInUser.user_metadata.showupvotes,
                });

                console.log(profiles)
                console.log(loggedInUser)
            }
        }

        getUserProfile()
    }, [loggedInUser])

    const getInitials = (firstName: string, lastName: string): string => {
        if (!firstName || !lastName) return ""; // Ensure both names are provided

        // Process first name: take the first letter of each word in the first name
        const firstInitials = firstName
            .split(" ")
            .filter(Boolean) // Remove extra spaces
            .map(part => part.charAt(0).toUpperCase()) // Take the first letter of each part
            .join(""); // Combine into a string

        // Process last name: take the first letter of each word in the last name
        const lastInitials = lastName
            .split(" ")
            .filter(Boolean) // Remove extra spaces
            .map(part => part.charAt(0).toUpperCase()) // Take the first letter of each part
            .join(""); // Combine into a string

        return firstInitials + lastInitials;
    }

    const handleLogout = async (): Promise<void> => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Logout error:", error.message);
        } else {
            setLoggedInUser(null); // Clear user on successful logout
            setUserProfile(null)
            navigate("/"); // Redirect to home page
        }
    };

    const handleLogoutButton = async () => {
        const setDialogContentData = async () => {
            setDialogContent({
                title: "Confirm Sign-out",
                content: "You will be sign-out of the application",
                buttonText: "Sign-out",
                action: handleLogout,
                cancel: () => { setDialog(false) },
            })
        }

        await setDialogContentData()
        setDialog(true)
    }

    return (
        <div className="flex m-auto h-full relative overflow-auto justify-center">

            <div className="min-h-full min-w-[700px] p-6 flex flex-col gap-6 h-fit border-r border-l">
                <h1 className="text-lg text-gray-700 font-bold"> Edit Profile </h1>

                <div className="bg-gray-100 p-5 rounded-lg flex items-center gap-4">
                    <div className="w-28 h-28">
                        <Avatar id="avatar" className="h-full w-full flex items-center justify-center">
                            <div className="bg-black hover:opacity-[.5] opacity-0 transition-all absolute h-full w-full flex justify-center items-center text-white cursor-pointer"> Change Photo </div>
                            <AvatarImage src="adasdasd" />
                            <AvatarFallback className="bg-red-200 text-lg font-bold text-gray-700">
                                {userProfile ? getInitials(userProfile.first_name, userProfile.last_name) : "USER"}
                            </AvatarFallback>
                        </Avatar>
                    </div>


                    <div className="flex flex-col">
                        <Label
                            htmlFor="avatar"
                            className="text-md text-gray-700 cursor-pointer font-semibold"
                        >
                            {loggedInUser ? loggedInUser.user_metadata.displayName : "User"}
                        </Label>
                        <Label
                            htmlFor="avatar"
                            className="text-md text-gray-500 cursor-pointer"

                        >
                            {userProfile ? userProfile.username : "Username"}
                        </Label>
                    </div>

                    <Button className="ml-auto" onClick={handleLogoutButton}>Sign-out</Button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4">
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="bio" className="text-gray-700 font-semibold">Bio</Label>
                        <div className="relative">
                            <Textarea
                                {...register("bio", {
                                    required: "Bio is required",
                                    maxLength: { value: 150, message: "Max of 150 characters" },
                                    minLength: { value: 2, message: "Min of 2 characters" }
                                })}
                                className="h-16"
                                id="bio"
                                placeholder="Type your Bio here"
                                onChange={handleCharCount} // Update character count on change
                            />
                            <p className="text-gray-500 text-sm absolute z-20 bottom-3 right-3">{charCount}/150</p> {/* Display character count */}
                        </div>
                        {errors.bio && <p className="text-red-500 text-sm">{errors.bio.message}</p>}

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

                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="username" className="text-gray-700 text-md font-semibold">Username</Label>
                        <Input
                            {...register("username", {
                                required: "Username is required", // Custom error message for required
                                minLength: {
                                    value: 3,
                                    message: "Username must be at least 3 characters long", // Minimum length validation
                                },
                            })}
                            className="h-16"
                            type="text"
                            id="username"
                            placeholder="Username"
                        />
                        {/* Error message display */}
                        {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="flex gap-3">
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="firstname" className="text-gray-700 text-md font-semibold">First Name</Label>
                                <Input
                                    {...register("firstname", {
                                        required: "First Name is required", // Custom error message for required
                                        minLength: {
                                            value: 2,
                                            message: "Firstname must be at least 2 characters", // Minimum length validation
                                        },
                                        maxLength: {
                                            value: 14,
                                            message: "Firstnamename must be 14 characters at max", // Minimum length validation
                                        },
                                    })}
                                    className="h-16"
                                    type="text"
                                    id="firstname"
                                    placeholder="First Name"

                                />
                            </div>

                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="lastname" className="text-gray-700 text-md font-semibold">Last Name</Label>
                                <Input
                                    {...register("lastname", {
                                        required: "Last Name is required", // Custom error message for required
                                        minLength: {
                                            value: 2,
                                            message: "Lastname must be at least 2 characters", // Minimum length validation
                                        },
                                        maxLength: {
                                            value: 14,
                                            message: "Lastname must be 14 characters at max", // Minimum length validation
                                        },
                                    })}
                                    className="h-16"
                                    type="text"
                                    id="lastname"
                                    placeholder="Last Name"
                                />
                            </div>
                        </div>
                        {/* Error message display */}
                        {errors.firstname && <p className="text-red-500 text-sm">{errors.firstname.message}</p>}
                        {errors.lastname && <p className="text-red-500 text-sm">{errors.lastname.message}</p>}

                    </div>

                    <div className="flex w-full items-center border p-4 rounded-2xl h-16">
                        <Label htmlFor="showupvote" className="text-gray-700 text-md font-semibold cursor-pointer">Show upvoted posts</Label>
                        <Switch
                            {...register("showupvote")}  // Register the switch value directly with react-hook-form
                            id="showupvote"
                            className="ml-auto"
                            // Hardcoded, for example purposes (you can bind this to your state)
                            onCheckedChange={(checked) => {
                                // Manually trigger `setValue` with a boolean value for the field
                                setValue("showupvote", checked);
                            }}
                        />

                    </div>

                    <Button type="submit" className="w-fit ml-auto h-12"> Submit Changes </Button>
                </form>
            </div>

            <AlertDialog open={isDialogOpen}>
                <AlertDialogOverlay className="bg-transparent" /> {/* Customize the overlay */}
                <AlertDialogContent className="z-[9999]">
                    <AlertDialogHeader>
                        <AlertDialogTitle> {dialogContent.title} </AlertDialogTitle>
                        <AlertDialogDescription>
                            {dialogContent.content}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={dialogContent.cancel}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={dialogContent.action}>{dialogContent.buttonText}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default Settings;
