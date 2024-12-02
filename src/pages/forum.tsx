import { useState, useEffect } from "react";
import { supabase } from "../config/supabase/supabaseClient";
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
    const [forums, setForums] = useState<Forum[]>([]);
    const [expandedStates, setExpandedStates] = useState<Record<string, boolean>>({});
    const [upvoteStates, setUpvoteStates] = useState<Record<string, boolean>>({});
    const [downvoteStates, setDownvoteStates] = useState<Record<string, boolean>>({});



    // useEffect(() => {
    //     const fetchForumsAndProfiles = async () => {
    //         try {
    //             // Fetch forums data
    //             const { data: forums, error: forumsError } = await supabase
    //                 .from("forums")
    //                 .select(`
    //                     forum_id,
    //                     uid,
    //                     title,
    //                     description,
    //                     upvotes,
    //                     downvotes,
    //                     count_comments,
    //                     date_created,
    //                     links_imgs
    //                 `);

    //             if (forumsError) throw forumsError;

    //             const profileIds = forums.map((forum) => forum.uid);

    //             // Fetch profiles data
    //             const { data: profiles, error: profilesError } = await supabase
    //                 .from("profiles")
    //                 .select("uid, first_name, last_name")
    //                 .in("uid", profileIds);

    //             if (profilesError) throw profilesError;

    //             // Fetch votes data for the current user
    //             const { data: votes, error: votesError } = await supabase
    //                 .from("forum_votes")
    //                 .select("forum_id, vote_type")
    //                 .eq("uid", "current_user_uid"); // Replace with the actual logged-in user ID

    //             if (votesError) throw votesError;

    //             // Map votes to upvote and downvote states
    //             const userUpvotes = new Set(votes.filter((vote) => vote.vote_type === "upvote").map((vote) => vote.forum_id));
    //             const userDownvotes = new Set(votes.filter((vote) => vote.vote_type === "downvote").map((vote) => vote.forum_id));

    //             const forumsWithProfiles = forums.map((forum) => ({
    //                 ...forum,
    //                 profiles: profiles.find((profile) => profile.uid === forum.uid) || null,
    //             }));

    //             // Set upvote and downvote states based on the fetched vote data
    //             const initialUpvoteStates: Record<string, boolean> = {};
    //             const initialDownvoteStates: Record<string, boolean> = {};

    //             forumsWithProfiles.forEach((forum) => {
    //                 initialUpvoteStates[forum.forum_id] = userUpvotes.has(forum.forum_id);
    //                 initialDownvoteStates[forum.forum_id] = userDownvotes.has(forum.forum_id);
    //             });

    //             setForums(forumsWithProfiles);
    //             setUpvoteStates(initialUpvoteStates);
    //             setDownvoteStates(initialDownvoteStates);
    //         } catch (error) {
    //             console.error("Error fetching forums and profiles:", error);
    //         }
    //     };

    //     fetchForumsAndProfiles();
    // }, []);

    useEffect(() => {
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

                const { data: currentUserVotes, error } = await supabase
                    .from('forum_votes')
                    .select('*')
                    .eq('uid', currentUserID);

                if (error) {
                    console.error("Error fetching forum votes:", error.message);
                    return;
                }

                // Set upvote and downvote states based on initial data
                const initialUpvoteStates: Record<string, boolean> = {};
                const initialDownvoteStates: Record<string, boolean> = {};

             
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

                console.log(initialDownvoteStates)
                setForums(forumsWithProfiles);
                setUpvoteStates(initialUpvoteStates);
                setDownvoteStates(initialDownvoteStates);
            } catch (error) {
                console.error("Error fetching forums and profiles:", error);
            }
        };

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

    return (
        <div className="flex ml-auto w-[75%] h-full">
            <ForumsSidebar />
            <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
                {forums.map((forum) => {
                    const isUpvoted = upvoteStates[forum.forum_id] || false;
                    const isDownvoted = downvoteStates[forum.forum_id] || false;

                    return (
                        <Card
                            key={forum.forum_id}
                            className="w-[500px] max-w-[500px] hover:shadow-lg transition-shadow cursor-pointer"
                        >
                            <CardHeader>
                                <div className="w-full flex items-center gap-3 cursor-pointer">
                                    <Avatar>
                                        <AvatarImage src="https://github.com/shadcn.png" />
                                        <AvatarFallback>
                                            {forum.profiles?.first_name?.[0] || "?"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <Label
                                        htmlFor=""
                                        className="text-md text-gray-700 cursor-pointer"
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
                                            onClick={() => toggleExpand(forum.forum_id)}
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
                                    <div className="box-border flex bg-gray-50 border border-gray-200 rounded-full">
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
        </div>
    );
}

export default Forum;
