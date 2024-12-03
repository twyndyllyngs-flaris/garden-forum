import { useState, useEffect } from "react";
import { supabase } from "../config/supabase/supabaseClient";
import { useNavigate } from "react-router-dom";
import "../styling/output.css";
import "non.geist";

// Components
import ForumsSidebar from "../components/sidebar/forums-sidebar";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "../components/ui/card";
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
import { ReceiptRussianRuble } from "lucide-react";

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

function Forum() {
    const navigate = useNavigate();

    const [forums, setForums] = useState<Forum[]>([]);
    const [expandedStates, setExpandedStates] = useState<Record<string, boolean>>({});
    const [upvoteStates, setUpvoteStates] = useState<Record<string, boolean>>({});
    const [downvoteStates, setDownvoteStates] = useState<Record<string, boolean>>({});

    const [isCreateSpaceOpen, setCreateSpace] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [imageFiles, setImageFiles] = useState<FileList | null>(null);
    const [loading, setLoading] = useState(false); // Loading state for the Post button

    const [forumDialog, setForumDialog] = useState(false)
    const [openedForumData, setOpenedForumData] = useState<Forum | null>(null)

    const fetchForumsAndProfiles = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        const currentUserID = user?.id;

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

    useEffect(() => {
        fetchForumsAndProfiles();
    }, []);

    const toggleExpand = (forumId: string) => {
        setExpandedStates((prevState) => ({
            ...prevState,
            [forumId]: !prevState[forumId],
        }));
    };

    const toggleUpvote = async (forumId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const currentUserID = user?.id;

            if (currentUserID == undefined) {
                navigate("/login")
                return;
            }

            setUpvoteStates((prevState) => ({
                ...prevState,
                [forumId]: !prevState[forumId],
            }));

            // If the post was downvoted, reset the downvote state
            if (downvoteStates[forumId]) {
                setDownvoteStates((prevState) => ({
                    ...prevState,
                    [forumId]: false,
                }));
            }

            const isCurrentlyUpvoted = upvoteStates[forumId];
            const currentForum = forums.find((forum) => forum.forum_id === forumId);
            if (!currentForum) return; // Exit if no forum is found

            // Update the database
            const { data, error } = await supabase
                .from("forums")
                .update({
                    upvotes: isCurrentlyUpvoted
                        ? currentForum.upvotes - 1
                        : currentForum.upvotes + 1,
                    downvotes: downvoteStates[forumId]
                        ? currentForum.downvotes - 1
                        : currentForum.downvotes,
                })
                .eq("forum_id", forumId);

            if (error) {
                console.error("Error updating upvote:", error.message);
            } else {
                console.log("Upvote updated successfully:", data);
                // Update the forums state with new upvotes
                setForums((prevForums) =>
                    prevForums.map((forum) =>
                        forum.forum_id === forumId
                            ? {
                                ...forum,
                                upvotes: isCurrentlyUpvoted
                                    ? forum.upvotes - 1
                                    : forum.upvotes + 1,
                                downvotes: downvoteStates[forumId]
                                    ? forum.downvotes - 1
                                    : forum.downvotes,
                            }
                            : forum
                    )
                );

                let newOpenedForumData = openedForumData;
                if (newOpenedForumData && isCurrentlyUpvoted) {
                    newOpenedForumData.upvotes -= 1;
                } else if (newOpenedForumData && !isCurrentlyUpvoted) {
                    newOpenedForumData.upvotes += 1;
                }

                if (newOpenedForumData && downvoteStates[forumId]) {
                    newOpenedForumData.downvotes -= 1;
                } else if (newOpenedForumData && !downvoteStates[forumId]) {
                    newOpenedForumData.downvotes += 1;
                }

                setOpenedForumData(newOpenedForumData)
            }

            // Query to check if a vote exists for this user and forum
            const { data: existingVote, error: existingVoteError } = await supabase
                .from("forum_votes")
                .select("*")
                .eq("forum_id", forumId)
                .eq("uid", currentUserID);

            if (existingVoteError) {
                console.error("Error checking existing vote:", existingVoteError.message);
                return;
            }

            if (existingVote?.length > 1) {
                console.error("Multiple votes found for user on this forum. This should not happen.");
                return;
            }

            if (existingVote && existingVote.length === 1) {
                // If a vote exists, update it
                const { data: updatedVote, error: updateError } = await supabase
                    .from("forum_votes")
                    .update({
                        vote_type: isCurrentlyUpvoted ? "none" : "upvote", // Toggle the vote
                    })
                    .eq("uid", currentUserID) // Update the existing vote by ID
                    .eq("forum_id", forumId)

                if (updateError) {
                    console.error("Error updating vote:", updateError.message);
                } else {
                    console.log("Vote updated:", updatedVote);
                }
            } else {
                // If no vote exists, insert a new one
                const { data: newVote, error: insertError } = await supabase
                    .from("forum_votes")
                    .insert({
                        forum_id: forumId,
                        uid: currentUserID,
                        vote_type: "upvote", // Set the new vote to "upvote"
                    });

                if (insertError) {
                    console.error("Error inserting new vote:", insertError.message);
                } else {
                    console.log("New vote inserted:", newVote);
                }
            }
        } catch (error) {
            console.error("Error toggling upvote:", error);
        }
    };

    const toggleDownvote = async (forumId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const currentUserID = user?.id;

            if (currentUserID == undefined) {
                navigate("/login")
                return;
            }

            setDownvoteStates((prevState) => ({
                ...prevState,
                [forumId]: !prevState[forumId],
            }));

            // If the post was upvoted, reset the upvote state
            if (upvoteStates[forumId]) {
                setUpvoteStates((prevState) => ({
                    ...prevState,
                    [forumId]: false,
                }));
            }

            const isCurrentlyDownvoted = downvoteStates[forumId];

            // Update the database
            const { data, error } = await supabase
                .from("forums")
                .update({
                    downvotes: isCurrentlyDownvoted
                        ? forums.find((forum) => forum.forum_id === forumId)?.downvotes! - 1
                        : forums.find((forum) => forum.forum_id === forumId)?.downvotes! + 1,
                    upvotes: upvoteStates[forumId]
                        ? forums.find((forum) => forum.forum_id === forumId)?.upvotes! - 1
                        : forums.find((forum) => forum.forum_id === forumId)?.upvotes,
                })
                .eq("forum_id", forumId);

            if (error) {
                console.error("Error updating downvote:", error.message);
            } else {
                console.log("Downvote updated successfully:", data);

                // Update the forums state with new downvotes
                setForums((prevForums) =>
                    prevForums.map((forum) =>
                        forum.forum_id === forumId
                            ? {
                                ...forum,
                                downvotes: isCurrentlyDownvoted
                                    ? forum.downvotes - 1
                                    : forum.downvotes + 1,
                                upvotes: upvoteStates[forumId]
                                    ? forum.upvotes - 1
                                    : forum.upvotes,
                            }
                            : forum
                    )
                );

                let newOpenedForumData = openedForumData;
                if (newOpenedForumData && isCurrentlyDownvoted) {
                    newOpenedForumData.downvotes -= 1;
                } else if (newOpenedForumData && !isCurrentlyDownvoted) {
                    newOpenedForumData.downvotes += 1;
                }

                if (newOpenedForumData && upvoteStates[forumId]) {
                    newOpenedForumData.upvotes -= 1;
                } else if (newOpenedForumData && !upvoteStates[forumId]) {
                    newOpenedForumData.upvotes += 1;
                }

                setOpenedForumData(newOpenedForumData)
            }

            // Query to check if a vote exists for this user and forum
            const { data: existingVote, error: existingVoteError } = await supabase
                .from("forum_votes")
                .select("*")
                .eq("forum_id", forumId)
                .eq("uid", currentUserID);

            if (existingVoteError) {
                console.error("Error checking existing vote:", existingVoteError.message);
                return;
            }

            if (existingVote?.length > 1) {
                console.error("Multiple votes found for user on this forum. This should not happen.");
                return;
            }

            if (existingVote && existingVote.length === 1) {
                // If a vote exists, update it
                const { data: updatedVote, error: updateError } = await supabase
                    .from("forum_votes")
                    .update({
                        vote_type: isCurrentlyDownvoted ? "none" : "downvote", // Toggle the vote
                    })
                    .eq("uid", currentUserID) // Update the existing vote by ID
                    .eq("forum_id", forumId)

                if (updateError) {
                    console.error("Error updating vote:", updateError.message);
                } else {
                    console.log("Vote updated:", updatedVote);
                }
            } else {
                // If no vote exists, insert a new one
                const { data: newVote, error: insertError } = await supabase
                    .from("forum_votes")
                    .insert({
                        forum_id: forumId,
                        uid: currentUserID,
                        vote_type: "upvote", // Set the new vote to "upvote"
                    });

                if (insertError) {
                    console.error("Error inserting new vote:", insertError.message);
                } else {
                    console.log("New vote inserted:", newVote);
                }
            }
        } catch (error) {
            console.error("Error toggling downvote:", error);
        }
    };

    const openCreateSpace = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        const currentUserID = user?.id;

        if (currentUserID == undefined) {
            navigate("/login")
            return;
        }

        setCreateSpace(true);
    }

    const closeCreateSpace = () => setCreateSpace(false);

    const handlePost = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); // Set loading to true when the post is being created

        try {
            // Get the current user
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            const uid = user?.id;

            // Generate forum_id
            const forumId = crypto.randomUUID();

            // Step 1: Insert the forum record with an empty image array
            const { error: insertError } = await supabase.from("forums").insert({
                forum_id: forumId,
                uid,
                title,
                description,
                links_imgs: [], // Empty array for now
            });

            if (insertError) throw insertError;

            // Step 2: Handle image uploads (optional)
            const imageLinks: string[] = [];
            if (imageFiles && imageFiles.length > 0) {
                for (const file of Array.from(imageFiles)) {
                    const filePath = `${uid}/${forumId}/${file.name}`;

                    // Step 2a: Upload the image to Supabase storage
                    const { error: uploadError } = await supabase.storage
                        .from("forums_images")
                        .upload(filePath, file);

                    if (uploadError) throw uploadError;

                    // Step 2b: Get the public URL of the uploaded image
                    const { data: publicUrlData } = supabase.storage
                        .from("forums_images")
                        .getPublicUrl(filePath);

                    if (publicUrlData?.publicUrl) {
                        imageLinks.push(publicUrlData.publicUrl); // Add the URL to the imageLinks array
                    }
                }

                // Step 3: Update the forum record with image links
                if (imageLinks.length > 0) {
                    const { error: updateError } = await supabase
                        .from("forums")
                        .update({ links_imgs: imageLinks })
                        .eq("forum_id", forumId);

                    if (updateError) throw updateError;
                }
            }

            setTitle("");
            setDescription("");
            setImageFiles(null);
            setCreateSpace(false); // Close the dialog after the post is created successfully
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error("Error creating post:", error.message);
                alert(`Failed to create post: ${error.message}`);
            } else {
                console.error("Unexpected error:", error);
                alert("An unexpected error occurred.");
            }
        } finally {
            setLoading(false); // Set loading to false once the process is done
            fetchForumsAndProfiles();
        }
    }

    const openForumDialog = async (forum: Forum) => {
        setOpenedForumData(forum)
        setForumDialog(true);
    }

    const closeForumDialog = async () => {
        setForumDialog(false);
    }

    return (
        <div className="flex ml-auto w-[75%] h-full">
            <ForumsSidebar openCreateSpace={openCreateSpace} closeCreateSpace={closeCreateSpace} />

            <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
                {forums.map((forum) => {
                    const isUpvoted = upvoteStates[forum.forum_id] || false;
                    const isDownvoted = downvoteStates[forum.forum_id] || false;

                    return (
                        <Card
                            key={forum.forum_id}
                            className="w-[500px] max-w-[500px] hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => openForumDialog(forum)}
                        >
                            <CardHeader >
                                <div className="w-full flex items-center gap-3 cursor-pointer">
                                    <Avatar onClick={(e) => e.stopPropagation()}>
                                        <AvatarImage src="https://github.com/shadcn.png" />
                                        <AvatarFallback>
                                            {forum.profiles?.first_name?.[0] || "?"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <Label
                                        htmlFor=""
                                        className="text-md text-gray-700 cursor-pointer"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {forum.profiles?.first_name}{" "}
                                        {forum.profiles?.last_name}
                                    </Label>
                                    <Label className="text-gray-500 ml-auto">
                                        {new Date(forum.date_created).toLocaleDateString()}
                                    </Label>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardTitle className="text-md text-gray-700">
                                    {forum.title}
                                </CardTitle>
                                <CardDescription className="mt-2">
                                    {expandedStates[forum.forum_id]
                                        ? forum.description
                                        : forum.description.slice(0, 100) + "..."}
                                    {forum.description.length > 100 && (
                                        <span
                                            className="text-blue-500 cursor-pointer ml-2"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                toggleExpand(forum.forum_id)
                                            }
                                            }
                                        >
                                            {expandedStates[forum.forum_id]
                                                ? "See less"
                                                : "See more"}
                                        </span>
                                    )}
                                </CardDescription>
                                {forum.links_imgs?.length > 0 && (
                                    <div className="bg-gray-200 flex items-center justify-center mt-4">
                                        <img
                                            src={forum.links_imgs[0]}
                                            alt={forum.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                <div className="flex gap-1">
                                    <div className="box-border flex bg-gray-50 border border-gray-200 rounded-full" onClick={(e) => e.stopPropagation()}>
                                        <div
                                            className={`flex-1 flex items-center border-r border-gray-200 hover:bg-gray-100 rounded-tl-full rounded-bl-full gap-1 p-1 px-2 cursor-pointer select-none ${isUpvoted ? "bg-green-100" : ""
                                                }`}
                                            onClick={() => toggleUpvote(forum.forum_id)}
                                        >
                                            <svg
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M12 4 3 15h6v5h6v-5h6z"
                                                    stroke="#666"
                                                    strokeWidth="1.5"
                                                    fill={isUpvoted ? "#92c78b" : "none"}
                                                    strokeLinejoin="round"
                                                ></path>
                                            </svg>
                                            <div className="text-sm font-semibold text-gray-700">
                                                Upvote{" "}
                                                <span className="font-normal text-sm">
                                                    ⧇ {forum.upvotes}
                                                </span>
                                            </div>
                                        </div>
                                        <div
                                            className={`p-1 px-2 hover:bg-gray-100 rounded-tr-full rounded-br-full cursor-pointer select-none ${isDownvoted ? "bg-red-100" : ""
                                                }`}
                                            onClick={() => toggleDownvote(forum.forum_id)}
                                        >
                                            <svg
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="m12 20 9-11h-6V4H9v5H3z"
                                                    stroke="#666"
                                                    strokeWidth="1.5"
                                                    fill={isDownvoted ? "#cc4767" : "none"}
                                                    strokeLinejoin="round"
                                                ></path>
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="box-border flex hover:bg-gray-100 rounded-full">
                                        <div className="flex items-center gap-1 p-1 cursor-pointer select-none">
                                            <svg
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M12.071 18.86c4.103 0 7.429-3.102 7.429-6.93C19.5 8.103 16.174 5 12.071 5s-7.429 3.103-7.429 6.93c0 1.291.379 2.5 1.037 3.534.32.501-1.551 3.058-1.112 3.467.46.429 3.236-1.295 3.803-.99 1.09.585 2.354.92 3.701.92Z"
                                                    className="icon_svg-stroke icon_svg-fill"
                                                    stroke="#666"
                                                    strokeWidth="1.5"
                                                    fill="none"
                                                ></path>
                                            </svg>
                                            <span className="text-sm font-normal text-gray-700">
                                                {forum.count_comments}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>

            <AlertDialog open={isCreateSpaceOpen} onOpenChange={setCreateSpace}>
                <AlertDialogContent>
                    <form onSubmit={handlePost}>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex justify-center mb-2">Create Post</AlertDialogTitle>

                            <Input placeholder="Title" required value={title} onChange={(e) => setTitle(e.target.value)} />
                            <Textarea placeholder="Type your description here." required value={description} onChange={(e) => setDescription(e.target.value)} />
                            <Input id="picture" type="file" accept="image/*" onChange={(e) => setImageFiles(e.target.files)} />
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-4">
                            <AlertDialogCancel onClick={closeCreateSpace}>Cancel</AlertDialogCancel>
                            <Button type="submit" disabled={loading}> {/* Disable button when loading */}
                                {loading ? "Posting..." : "Post"} {/* Change text to 'Posting...' when loading */}
                            </Button>
                        </AlertDialogFooter>
                    </form>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={forumDialog} onOpenChange={setForumDialog}>
                <AlertDialogContent className="w-[70%] h-[90%] max-w-none z-[9998] p-0 border-none">
                    <AlertDialogCancel
                        onClick={closeForumDialog}
                        className="fixed w-11 h-11 top-[-30px] left-[-270px] rounded-full font-bold text-gray-700"
                    >
                        X
                    </AlertDialogCancel>

                    <div className="w-full h-full max-h-full overflow-auto flex rounded-md">
                        <div className="w-[70%] h-full rounded-md">
                            <img
                                src={openedForumData?.links_imgs?.[0] || "https://via.placeholder.com/600?text=No+Image+Available"}
                                alt={openedForumData?.title || "No title available"}
                                className="w-full h-full object-cover rounded-md"
                            />
                        </div>

                        <div className="w-[30%] h-full max-h-full overflow-auto p-6 relative">
                            <div className="flex gap-2 items-center">
                                <Avatar onClick={(e) => e.stopPropagation()}>
                                    <AvatarImage src="https://github.com/shadcn.png" />
                                    <AvatarFallback>
                                        CN
                                    </AvatarFallback>
                                </Avatar>
                                <Label
                                    htmlFor=""
                                    className="text-md text-gray-700 cursor-pointer"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {openedForumData?.profiles?.first_name}{" "}
                                    {openedForumData?.profiles?.last_name}
                                </Label>
                                <Label className="text-gray-500 ml-auto">
                                    {openedForumData?.date_created
                                        ? new Date(openedForumData.date_created).toLocaleDateString()
                                        : "Unknown date"}
                                </Label>
                            </div>


                            <div className="mt-4">
                                <div className="text-md font-semibold text-gray-800 mb-4">
                                    {openedForumData?.title}
                                </div>
                                <div className="text-sm text-gray-600 leading-relaxed">
                                    {openedForumData?.description}
                                </div>

                                <Separator className="mt-4" />

                                <div className="mt-4">
                                    <div className="flex w-fit border rounded-full">
                                        <div
                                            className={`flex-1 flex items-center border-r border-gray-200 hover:bg-gray-100 rounded-tl-full rounded-bl-full gap-1 p-1 px-2 cursor-pointer select-none 
                                            ${upvoteStates[openedForumData?.forum_id || 1] ? "bg-green-100" : ""}`}
                                            onClick={() => toggleUpvote(openedForumData?.forum_id || "1")}
                                        >
                                            <svg
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M12 4 3 15h6v5h6v-5h6z"
                                                    stroke="#666"
                                                    strokeWidth="1.5"
                                                    // fill={isUpvoted ? "#92c78b" : "none"}
                                                    fill={upvoteStates[openedForumData?.forum_id || 1] ? "#92c78b" : "none"}
                                                    strokeLinejoin="round"
                                                ></path>
                                            </svg>
                                            <div className="text-sm font-semibold text-gray-700">
                                                Upvote{" "}
                                                <span className="font-normal text-sm">
                                                    ⧇ {openedForumData?.upvotes}
                                                </span>
                                            </div>
                                        </div>
                                        <div
                                            className={`p-1 px-2 hover:bg-gray-100 rounded-tr-full rounded-br-full cursor-pointer select-none 
                                            ${downvoteStates[openedForumData?.forum_id || 1] ? "bg-red-100" : ""}
                                        `}
                                            onClick={() => toggleDownvote(openedForumData?.forum_id || "1")}
                                        >
                                            <svg
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="m12 20 9-11h-6V4H9v5H3z"
                                                    stroke="#666"
                                                    strokeWidth="1.5"
                                                    fill={downvoteStates[openedForumData?.forum_id || 1] ? "#cc4767" : "none"}
                                                    strokeLinejoin="round"
                                                ></path>
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <Separator className="mt-4" />

                                <div className="w-full flex flex-col gap-4 mt-4">
                                    <div className="flex flex-col w-full">
                                        <div className="w-full flex gap-4">
                                            <Avatar onClick={(e) => e.stopPropagation()}>
                                                <AvatarImage src="https://github.com/shadcn.png" />
                                                <AvatarFallback>
                                                    CN
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className="flex flex-col bg-gray-100 relative rounded p-3">
                                                <Label
                                                    htmlFor=""
                                                    className="text-md text-gray-700 cursor-pointer"
                                                >
                                                    Ralph Matthew De Leon
                                                </Label>
                                                <h2 className="text-gray-700 text-[.9rem]">
                                                    Lorem, ipsum dolor sit amet consectetur adipisicing elit. Placeat fugiat minus libero corrupti dolores voluptatum!
                                                </h2>
                                            </div>
                                        </div>

                                        <div className=" ml-auto flex items-center">
                                            <Label className="text-gray-500">
                                                11/30/24
                                            </Label>

                                            <Button className="text-gray-700" variant="link">
                                                Reply
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col w-full">
                                        <div className="w-full flex gap-4">
                                            <Avatar onClick={(e) => e.stopPropagation()}>
                                                <AvatarImage src="https://github.com/shadcn.png" />
                                                <AvatarFallback>
                                                    CN
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className="flex flex-col bg-gray-100 relative rounded p-3">
                                                <Label
                                                    htmlFor=""
                                                    className="text-md text-gray-700 cursor-pointer"
                                                >
                                                    Ralph Matthew De Leon
                                                </Label>
                                                <h2 className="text-gray-700 text-[.9rem]">
                                                    Lorem, ipsum dolor sit amet consectetur adipisicing elit. Placeat fugiat minus libero corrupti dolores voluptatum!
                                                </h2>
                                            </div>
                                        </div>

                                        <div className=" ml-auto flex items-center">
                                            <Label className="text-gray-500">
                                                11/30/24
                                            </Label>

                                            <Button className="text-gray-700" variant="link">
                                                Reply
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            <div className="w-full h-20 sticky bottom-0">
                                <Textarea placeholder="Comment as Ralph Matthew De Leon" required value={description} onChange={(e) => setDescription(e.target.value)} />
                            </div>

                        </div>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default Forum;
