import { useEffect, useState } from "react"; // Import useState
import { supabase } from "../config/supabase/supabaseClient"; // Adjust the import path as needed
import { Link, useNavigate } from "react-router-dom"; // Import from react-router-dom
import '../styling/output.css';
import "non.geist"

//components
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Separator } from "../components/ui/seperator";
import { Button } from "../components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "../components/ui/tabs"

// ts interface
interface Forum {
    forum_id: string;
    uid: string;
    title: string;
    description: string;
    upvotes: number;
    downvotes: number;
    count_comments: number;
    date_created: string;
    links_imgs: string[];
    profiles: {
        first_name: string;
        last_name: string;
    } | null;
}

interface AlertDialogContent {
    title: string,
    content: string,
    buttonText: string,
    action: () => Promise<void>,
    cancel: () => void,
}

function Profile() {
    const navigate = useNavigate();

    //states
    const [loggedInUser, setLoggedInUser] = useState<any>(null)

    const [forums, setForums] = useState<Forum[]>([]);
    const [expandedStates, setExpandedStates] = useState<Record<string, boolean>>({});
    const [upvoteStates, setUpvoteStates] = useState<Record<string, boolean>>({});
    const [downvoteStates, setDownvoteStates] = useState<Record<string, boolean>>({});

    const fetchForumsAndProfiles = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        const currentUserID = user?.id;

        setLoggedInUser(user)

        try {
            const { data: forums, error: forumsError } = await supabase
                .from("forums")
                .select(`
                    forum_id,
                    uid,
                    title,
                    description,
                    upvotes,
                    downvotes,
                    count_comments,
                    date_created,
                    links_imgs
                `);

            if (forumsError) throw forumsError;

            const profileIds = forums.map((forum) => forum.uid);

            const { data: profiles, error: profilesError } = await supabase
                .from("profiles")
                .select("uid, first_name, last_name")
                .in("uid", profileIds);

            if (profilesError) throw profilesError;

            const forumsWithProfiles = forums.map((forum) => ({
                ...forum,
                profiles: profiles.find((profile) => profile.uid === forum.uid) || null,
            }));

            // Set upvote and downvote states based on initial data
            const initialUpvoteStates: Record<string, boolean> = {};
            const initialDownvoteStates: Record<string, boolean> = {};

            if (currentUserID != undefined) {
                const { data: currentUserVotes, error } = await supabase
                    .from('forum_votes')
                    .select('*')
                    .eq('uid', currentUserID);

                if (error) {
                    console.error("Error fetching forum votes:", error.message);
                    return;
                }

                forumsWithProfiles.forEach((forum) => {
                    // Set initial states to false by default
                    initialUpvoteStates[forum.forum_id] = false;
                    initialDownvoteStates[forum.forum_id] = false;

                    // Find if the current user has voted on this forum
                    const userVote = currentUserVotes?.find((vote) => vote.forum_id === forum.forum_id);

                    if (userVote) {
                        // Set upvote or downvote based on the vote type
                        if (userVote.vote_type === "upvote") {
                            initialUpvoteStates[forum.forum_id] = true;
                        } else if (userVote.vote_type === "downvote") {
                            initialDownvoteStates[forum.forum_id] = true;
                        }
                    }
                });
            } else {
                forumsWithProfiles.forEach((forum) => {
                    // Set initial states to false by default
                    initialUpvoteStates[forum.forum_id] = false;
                    initialDownvoteStates[forum.forum_id] = false;
                });
            }

            setForums(forumsWithProfiles);
            setUpvoteStates(initialUpvoteStates);
            setDownvoteStates(initialDownvoteStates);
        } catch (error) {
            console.error("Error fetching forums and profiles:", error);
        }
    };

    const [forumDialog, setForumDialog] = useState(false)
    const [openedForumData, setOpenedForumData] = useState<Forum | null>(null)
    const [openedForumComments, setOpenedForumComments] = useState<any>(null)
    const [newComment, setNewComment] = useState("")
    const [deleteCommentDialog, setDeleteCommentDialog] = useState(false)
    const [deleteCommentID, setDeleteCommentID] = useState("")
    const [dialogContent, setDialogContent] = useState<AlertDialogContent>({
        title: "Are you sure?",
        content: "This action cannot be undone. This will permanently delete your data and remove it from our servers.",
        buttonText: "Delete",
        action: async () => { return },
        cancel: () => { return },
    })
    const [deleteForumID, setDeleteForumID] = useState<string | null>(null)

    useEffect(() => {
        fetchForumsAndProfiles();
    }, []);

    return (
        <div className="min-h-full overflow-auto flex justify-center">
            <div className="w-[50%] box-border p-10 border-l border-r border-gray-200 ">
                {/* profile labels */}
                <div className="flex bg-gray-100">
                    <div className="w-[400px] h-60 flex justify-center items-center">
                        <Avatar onClick={(e) => e.stopPropagation()} className="w-[200px] h-[200px]">
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>
                                ""
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    <div className="w-full flex flex-col gap-3 justify-center">
                        <h1 className="font-semibold text-gray-700 text-lg">Ralph Matthew De Leon</h1>
                        <h2 className="font-semibold text-gray-700">0 posts</h2>
                        <h3 className="text-gray-700">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nobis explicabo quis deserunt iusto neque consectetur, natus similique velit odio accusantium.</h3>
                        <div className="flex items-center mt-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-calendar-days mr-2 h-4 w-4 opacity-70"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path><path d="M8 14h.01"></path><path d="M12 14h.01"></path><path d="M16 14h.01"></path><path d="M8 18h.01"></path><path d="M12 18h.01"></path><path d="M16 18h.01"></path></svg>
                            <h4 className=" text-gray-500">Joined since 2024</h4>
                        </div>

                    </div>
                </div>

                <Separator className="mt-6" />

                {/* my posts */}
                <div className="flex justify-center">
                    <Tabs defaultValue="My Posts" className="w-[500px] rounded-none">
                        <TabsList className="grid w-full grid-cols-2 bg-transparent rounded-none  relative -top-[5px]">
                            <TabsTrigger
                                value="My Posts"
                                className="transition-none flex gap-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-t-2 
                                border-gray-600 rounded-none data-[state=active]:text-gray-700">
                                <svg aria-label="" className="x1lliihq x1n2onr6 x5n08af" fill="currentColor" height="12" role="img" viewBox="0 0 24 24" width="12"><title></title><rect fill="none" height="18" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" width="18" x="3" y="3"></rect><line fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="9.015" x2="9.015" y1="3" y2="21"></line><line fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="14.985" x2="14.985" y1="3" y2="21"></line><line fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="21" x2="3" y1="9.015" y2="9.015"></line><line fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="21" x2="3" y1="14.985" y2="14.985"></line></svg>
                                My Posts
                            </TabsTrigger>
                            <TabsTrigger
                                value="Upvoted Posts"
                                className="transition-none flex gap-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-t-2 
                                border-gray-600 rounded-none data-[state=active]:text-gray-700">
                                <svg aria-label="" className="x1lliihq x1n2onr6 x1roi4f4" fill="currentColor" height="12" role="img" viewBox="0 0 24 24" width="12"><title></title><polygon fill="none" points="20 21 12 13.44 4 21 4 3 20 3 20 21" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></polygon></svg>
                                Upvoted Posts
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="My Posts">
                            <div className="w-[500px] h-[1000px] bg-red-200">
                                test
                            </div>
                        </TabsContent>
                        <TabsContent value="Upvoted Posts">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Password</CardTitle>
                                    <CardDescription>
                                        Change your password here. After saving, you'll be logged out.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="space-y-1">
                                        <Label htmlFor="current">Current password</Label>
                                        <Input id="current" type="password" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="new">New password</Label>
                                        <Input id="new" type="password" />
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button>Save password</Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

export default Profile;
