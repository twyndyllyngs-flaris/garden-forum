import { useEffect, useState } from 'react' // Import useState
import { supabase } from '../config/supabase/supabaseClient' // Adjust the import path as needed
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom' // Import from react-router-dom
import '../styling/output.css'
import 'non.geist'

//components
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Separator } from '../components/ui/seperator'
import { Button } from '../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../components/ui/drop-down'
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
import { Textarea } from '../components/ui/text-area'

//icons
import { FaPaperPlane } from 'react-icons/fa'
import { IoClose } from 'react-icons/io5'
import { MdMoreHoriz } from 'react-icons/md'

// ts interface
interface Forum {
  forum_id: string
  uid: string
  title: string
  description: string
  upvotes: number
  downvotes: number
  count_comments: number
  date_created: string
  links_imgs: string[]
  profiles: {
    first_name: string
    last_name: string
    profile_link: string
    username: string
  } | null
}

interface AlertDialogContent {
  title: string
  content: string
  buttonText: string
  action: () => Promise<void>
  cancel: () => void
}

function Profile () {
  const navigate = useNavigate()
  const { uid } = useParams() // Extract forum_id from the URL
  const [searchParams] = useSearchParams()

  //states
  const [loggedInUser, setLoggedInUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  const [forums, setForums] = useState<Forum[]>([])
  const [expandedStates, setExpandedStates] = useState<Record<string, boolean>>(
    {}
  )
  const [upvoteStates, setUpvoteStates] = useState<Record<string, boolean>>({})
  const [openedProfileUserUpvoteStates, setOpenedProfileUserUpvoteStates] =
    useState<any[] | null>([])
  const [downvoteStates, setDownvoteStates] = useState<Record<string, boolean>>(
    {}
  )
  const [voteLocks, setVoteLocks] = useState<Record<string, boolean>>({})

  const [forumDialog, setForumDialog] = useState(false)
  const [openedForumData, setOpenedForumData] = useState<Forum | null>(null)
  const [openedForumComments, setOpenedForumComments] = useState<any>(null)
  const [newComment, setNewComment] = useState('')
  const [deleteCommentDialog, setDeleteCommentDialog] = useState(false)
  const [deleteCommentID, setDeleteCommentID] = useState('')
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
  const [deleteForumID, setDeleteForumID] = useState<string | null>(null)
  const [isUserExist, setUserExist] = useState(false)

  const fetchForumsAndProfiles = async () => {
    const {
      data: { user }
    } = await supabase.auth.getUser()
    const currentUserID = user?.id

    setLoggedInUser(user)

    try {
      const { data: forums, error: forumsError } = await supabase
        .from('forums')
        .select(
          `
                    forum_id,
                    uid,
                    title,
                    description,
                    upvotes,
                    downvotes,
                    count_comments,
                    date_created,
                    links_imgs
                `
        )
        .order('date_created', { ascending: false })

      if (forumsError) throw forumsError

      const profileIds = forums.map(forum => forum.uid)

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('uid, first_name, last_name, profile_link, username')
        .in('uid', profileIds)

      if (profilesError) throw profilesError

      const forumsWithProfiles = forums.map(forum => ({
        ...forum,
        profiles: profiles.find(profile => profile.uid === forum.uid) || null
      }))

      // Set upvote and downvote states based on initial data
      const initialUpvoteStates: Record<string, boolean> = {}
      const initialDownvoteStates: Record<string, boolean> = {}

      if (currentUserID != undefined) {
        const { data: currentUserVotes, error } = await supabase
          .from('forum_votes')
          .select('*')
          .eq('uid', currentUserID)

        if (error) {
          console.error('Error fetching forum votes:', error.message)
          return
        }

        forumsWithProfiles.forEach(forum => {
          // Set initial states to false by default
          initialUpvoteStates[forum.forum_id] = false
          initialDownvoteStates[forum.forum_id] = false

          // Find if the current user has voted on this forum
          const userVote = currentUserVotes?.find(
            vote => vote.forum_id === forum.forum_id
          )

          if (userVote) {
            // Set upvote or downvote based on the vote type
            if (userVote.vote_type === 'upvote') {
              initialUpvoteStates[forum.forum_id] = true
            } else if (userVote.vote_type === 'downvote') {
              initialDownvoteStates[forum.forum_id] = true
            }
          }
        })
      } else {
        forumsWithProfiles.forEach(forum => {
          // Set initial states to false by default
          initialUpvoteStates[forum.forum_id] = false
          initialDownvoteStates[forum.forum_id] = false
        })
      }

      setForums(forumsWithProfiles)
      setUpvoteStates(initialUpvoteStates)
      setDownvoteStates(initialDownvoteStates)
    } catch (error) {
      console.error('Error fetching forums and profiles:', error)
    }
  }

  useEffect(() => {
    fetchForumsAndProfiles()
  }, [])

  useEffect(() => {
    const getUserProfile = async () => {
      const { data: userProfile, error: forumsError } = await supabase
        .from('profiles')
        .select(`*`)
        .eq('username', uid)

      if (forumsError) {
        console.error(forumsError)
        return
      }

      if (userProfile.length === 0) {
        setUserExist(false)
        return
      }

      setProfile(userProfile[0])
      setUserExist(true)
    }

    getUserProfile()
  }, [uid])

  useEffect(() => {
    if (!profile) return

    const getUserVotes = async () => {
      const { data, error } = await supabase
        .from('forum_votes')
        .select('*')
        .eq('uid', profile.uid) // Replace 'value' with the actual uid you are filtering by
        .eq('vote_type', 'upvote') // Filter for 'upvote' votes

      if (error) {
        console.error('Error fetching data:', error.message)
      } else {
        setOpenedProfileUserUpvoteStates(data)
      }
    }

    getUserVotes()
  }, [profile])

  const toggleExpand = (forumId: string) => {
    setExpandedStates(prevState => ({
      ...prevState,
      [forumId]: !prevState[forumId]
    }))
  }

  const toggleUpvote = async (forumId: string) => {
    if (voteLocks[forumId]) return // Prevent action if locked

    setVoteLocks(prev => ({ ...prev, [forumId]: true })) // Lock the vote action

    try {
      const {
        data: { user }
      } = await supabase.auth.getUser()
      const currentUserID = user?.id

      if (currentUserID == undefined) {
        navigate('/login')
        return
      }

      setUpvoteStates(prevState => ({
        ...prevState,
        [forumId]: !prevState[forumId]
      }))

      // If the post was downvoted, reset the downvote state
      if (downvoteStates[forumId]) {
        setDownvoteStates(prevState => ({
          ...prevState,
          [forumId]: false
        }))
      }

      const isCurrentlyUpvoted = upvoteStates[forumId]
      const currentForum = forums.find(forum => forum.forum_id === forumId)
      if (!currentForum) return // Exit if no forum is found

      // Update the database
      const { data, error } = await supabase
        .from('forums')
        .update({
          upvotes: isCurrentlyUpvoted
            ? currentForum.upvotes - 1
            : currentForum.upvotes + 1,
          downvotes: downvoteStates[forumId]
            ? currentForum.downvotes - 1
            : currentForum.downvotes
        })
        .eq('forum_id', forumId)

      if (error) {
        console.error('Error updating upvote:', error.message)
      } else {
        console.log('Upvote updated successfully:', data)
        // Update the forums state with new upvotes
        setForums(prevForums =>
          prevForums.map(forum =>
            forum.forum_id === forumId
              ? {
                  ...forum,
                  upvotes: isCurrentlyUpvoted
                    ? forum.upvotes - 1
                    : forum.upvotes + 1,
                  downvotes: downvoteStates[forumId]
                    ? forum.downvotes - 1
                    : forum.downvotes
                }
              : forum
          )
        )

        let newOpenedForumData = openedForumData
        if (newOpenedForumData && isCurrentlyUpvoted) {
          newOpenedForumData.upvotes -= 1
        } else if (newOpenedForumData && !isCurrentlyUpvoted) {
          newOpenedForumData.upvotes += 1
        }

        if (newOpenedForumData && downvoteStates[forumId]) {
          newOpenedForumData.downvotes -= 1
        } else if (newOpenedForumData && !downvoteStates[forumId]) {
          newOpenedForumData.downvotes += 1
        }

        setOpenedForumData(newOpenedForumData)
      }

      // Query to check if a vote exists for this user and forum
      const { data: existingVote, error: existingVoteError } = await supabase
        .from('forum_votes')
        .select('*')
        .eq('forum_id', forumId)
        .eq('uid', currentUserID)

      if (existingVoteError) {
        console.error(
          'Error checking existing vote:',
          existingVoteError.message
        )
        return
      }

      if (existingVote?.length > 1) {
        console.error(
          'Multiple votes found for user on this forum. This should not happen.'
        )
        return
      }

      if (existingVote && existingVote.length === 1) {
        // If a vote exists, update it
        const { data: updatedVote, error: updateError } = await supabase
          .from('forum_votes')
          .update({
            vote_type: isCurrentlyUpvoted ? 'none' : 'upvote' // Toggle the vote
          })
          .eq('uid', currentUserID) // Update the existing vote by ID
          .eq('forum_id', forumId)

        if (updateError) {
          console.error('Error updating vote:', updateError.message)
        } else {
          console.log('Vote updated:', updatedVote)
        }
      } else {
        // If no vote exists, insert a new one
        const { data: newVote, error: insertError } = await supabase
          .from('forum_votes')
          .insert({
            forum_id: forumId,
            uid: currentUserID,
            vote_type: 'upvote' // Set the new vote to "upvote"
          })

        if (insertError) {
          console.error('Error inserting new vote:', insertError.message)
        } else {
          console.log('New vote inserted:', newVote)
        }
      }
    } catch (error) {
      console.error('Error toggling upvote:', error)
    } finally {
      setVoteLocks(prev => ({ ...prev, [forumId]: false })) // Unlock the vote action
    }
  }

  const toggleDownvote = async (forumId: string) => {
    if (voteLocks[forumId]) return // Prevent action if locked

    setVoteLocks(prev => ({ ...prev, [forumId]: true })) // Lock the vote action

    try {
      const {
        data: { user }
      } = await supabase.auth.getUser()
      const currentUserID = user?.id

      if (currentUserID == undefined) {
        navigate('/login')
        return
      }

      setDownvoteStates(prevState => ({
        ...prevState,
        [forumId]: !prevState[forumId]
      }))

      // If the post was upvoted, reset the upvote state
      if (upvoteStates[forumId]) {
        setUpvoteStates(prevState => ({
          ...prevState,
          [forumId]: false
        }))
      }

      const isCurrentlyDownvoted = downvoteStates[forumId]

      // Update the database
      const { data, error } = await supabase
        .from('forums')
        .update({
          downvotes: isCurrentlyDownvoted
            ? forums.find(forum => forum.forum_id === forumId)?.downvotes! - 1
            : forums.find(forum => forum.forum_id === forumId)?.downvotes! + 1,
          upvotes: upvoteStates[forumId]
            ? forums.find(forum => forum.forum_id === forumId)?.upvotes! - 1
            : forums.find(forum => forum.forum_id === forumId)?.upvotes
        })
        .eq('forum_id', forumId)

      if (error) {
        console.error('Error updating downvote:', error.message)
      } else {
        console.log('Downvote updated successfully:', data)

        // Update the forums state with new downvotes
        setForums(prevForums =>
          prevForums.map(forum =>
            forum.forum_id === forumId
              ? {
                  ...forum,
                  downvotes: isCurrentlyDownvoted
                    ? forum.downvotes - 1
                    : forum.downvotes + 1,
                  upvotes: upvoteStates[forumId]
                    ? forum.upvotes - 1
                    : forum.upvotes
                }
              : forum
          )
        )

        let newOpenedForumData = openedForumData
        console.log('1', openedForumData)
        if (newOpenedForumData && isCurrentlyDownvoted) {
          newOpenedForumData.downvotes -= 1
        } else if (newOpenedForumData && !isCurrentlyDownvoted) {
          newOpenedForumData.downvotes += 1
        }

        if (newOpenedForumData && upvoteStates[forumId]) {
          newOpenedForumData.upvotes -= 1
        }
        // else if (newOpenedForumData && !upvoteStates[forumId]) {
        //     newOpenedForumData.upvotes += 1;
        // }

        console.log(newOpenedForumData, openedForumData)

        setOpenedForumData(newOpenedForumData)
      }

      // Query to check if a vote exists for this user and forum
      const { data: existingVote, error: existingVoteError } = await supabase
        .from('forum_votes')
        .select('*')
        .eq('forum_id', forumId)
        .eq('uid', currentUserID)

      if (existingVoteError) {
        console.error(
          'Error checking existing vote:',
          existingVoteError.message
        )
        return
      }

      if (existingVote?.length > 1) {
        console.error(
          'Multiple votes found for user on this forum. This should not happen.'
        )
        return
      }

      if (existingVote && existingVote.length === 1) {
        // If a vote exists, update it
        const { data: updatedVote, error: updateError } = await supabase
          .from('forum_votes')
          .update({
            vote_type: isCurrentlyDownvoted ? 'none' : 'downvote' // Toggle the vote
          })
          .eq('uid', currentUserID) // Update the existing vote by ID
          .eq('forum_id', forumId)

        if (updateError) {
          console.error('Error updating vote:', updateError.message)
        } else {
          console.log('Vote updated:', updatedVote)
        }
      } else {
        // If no vote exists, insert a new one
        const { data: newVote, error: insertError } = await supabase
          .from('forum_votes')
          .insert({
            forum_id: forumId,
            uid: currentUserID,
            vote_type: 'downvote' // Set the new vote to "upvote"
          })

        if (insertError) {
          console.error('Error inserting new vote:', insertError.message)
        } else {
          console.log('New vote inserted:', newVote)
        }
      }
    } catch (error) {
      console.error('Error toggling downvote:', error)
    } finally {
      setVoteLocks(prev => ({ ...prev, [forumId]: false })) // Unlock the vote action
    }
  }

  const openForumDialog = async (forum: any) => {
    // Fetch comments from Supabase
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select(
        `
                  comment_id,
                  forum_id,
                  uid,
                  parent_id,
                  content,
                  date_created,
                  profiles(
                      first_name,
                      last_name,
                      username
                  )
              `
      )
      .eq('forum_id', forum.forum_id)

    if (commentsError) {
      console.error('Error fetching comments:', commentsError)
      throw commentsError
    }

    const flattenedComments = comments.map(origCommentInterface => ({
      comment_id: origCommentInterface.comment_id,
      forum_id: origCommentInterface.forum_id,
      uid: origCommentInterface.uid,
      parent_id: origCommentInterface.parent_id,
      content: origCommentInterface.content,
      date_created: origCommentInterface.date_created,
      first_name: Object.values(origCommentInterface.profiles)[1],
      last_name: Object.values(origCommentInterface.profiles)[2],
      username: Object.values(origCommentInterface.profiles)[0]
    }))

    const commentIdInSearch = searchParams.get('comment_id')

    let reorderedComments = flattenedComments

    if (commentIdInSearch) {
      const specificComment = flattenedComments.find(
        comment => comment.comment_id === commentIdInSearch
      )

      if (specificComment) {
        console.log('Specific comment found, placing it first in line')
        // Remove that specific comment from the general list
        reorderedComments = flattenedComments.filter(
          comment => comment.comment_id !== commentIdInSearch
        )
        // Put the specific comment at the top of the list
        reorderedComments = [specificComment, ...reorderedComments]
      } else {
        console.warn('Comment ID passed but not found in the fetched data')
      }
    }

    // Render reordered comments list
    setOpenedForumComments(reorderedComments)
    setOpenedForumData(forum)
    setForumDialog(true)
  }

  const closeForumDialog = async () => {
    setForumDialog(false)
    console.log(openedForumComments)
    // navigate('/forum');
  }

  const handleComment = async () => {
    if (!loggedInUser) navigate('/login')

    if (newComment == '') return

    const comment_id = crypto.randomUUID()
    const date_created = new Date().toISOString()

    const { data, error } = await supabase
      .from('comments') // The table where comments are stored
      .insert([
        {
          comment_id: comment_id,
          forum_id: openedForumData?.forum_id, // ID of the forum the comment belongs to
          uid: loggedInUser.id, // ID of the user posting the comment
          content: newComment, // The actual content of the comment
          date_created: date_created // Current timestamp
        }
      ])

    if (error) throw error

    setNewComment('')

    const newItem = {
      comment_id: comment_id,
      content: newComment,
      date_created: date_created,
      first_name: loggedInUser.user_metadata.first_name,
      forum_id: openedForumData?.forum_id,
      last_name: loggedInUser.user_metadata.last_name,
      uid: loggedInUser.id
    }

    setOpenedForumComments((prevComments: any) => [...prevComments, newItem])

    setForums(prevForums =>
      prevForums.map(forum =>
        forum.forum_id === openedForumData?.forum_id
          ? { ...forum, count_comments: forum.count_comments + 1 }
          : forum
      )
    )
  }

  const openDeleteCommentDialog = async (comment_id: string) => {
    setDeleteCommentID(comment_id)
  }

  const handleCloseCommentDialog = () => {
    setDeleteCommentID('')
  }

  useEffect(() => {
    if (deleteCommentID) {
      setDialogContent({
        title: 'Are you sure?',
        content:
          'This action cannot be undone. This willa permanently delete your comment and remove your data from our servers.',
        buttonText: 'Delete',
        action: handleDeleteComment,
        cancel: handleCloseCommentDialog
      })
      setDeleteCommentDialog(true)
    } else {
      setDeleteCommentDialog(false)
    }
  }, [deleteCommentID])

  const handleDeleteComment = async () => {
    console.log(deleteCommentID)
    const { data, error } = await supabase
      .from('comments')
      .delete()
      .eq('comment_id', deleteCommentID)

    if (error) console.error('Error deleting comment:', error.message)
    else console.log('Comment deleted successfully:', data)

    // Remove the comment from the opened forum's comments
    setOpenedForumComments((prevComments: any) =>
      prevComments.filter(
        (comment: any) => comment.comment_id !== deleteCommentID
      )
    )

    // Decrement the comment count for the corresponding forum
    setForums(prevForums =>
      prevForums.map(forum =>
        forum.forum_id === openedForumData?.forum_id
          ? { ...forum, count_comments: forum.count_comments - 1 }
          : forum
      )
    )

    handleCloseCommentDialog()
  }

  const openDeletePostDialog = async (forum_id: string) => {
    setDeleteForumID(forum_id)
  }

  const closeDeletePostDialog = () => {
    setDeleteForumID(null)
  }

  useEffect(() => {
    if (deleteForumID) {
      setDialogContent({
        title: 'Are you sure?',
        content:
          'This action cannot be undone. This willa permanently delete your forum and remove your data from our servers.',
        buttonText: 'Delete',
        action: handleDeleteForum,
        cancel: closeDeletePostDialog
      })
      setDeleteCommentDialog(true)
    } else {
      setDeleteCommentDialog(false)
    }
  }, [deleteForumID])

  const handleDeleteForum = async () => {
    console.log(deleteForumID)

    const { data, error } = await supabase
      .from('forums')
      .delete()
      .eq('forum_id', deleteForumID)

    if (error) console.error('Error deleting comment:', error.message)
    else console.log('Comment deleted successfully:', data)

    // Remove the forum from the forums state
    setForums((prevForums: any) =>
      prevForums.filter((forum: any) => forum.forum_id !== deleteForumID)
    )

    closeDeletePostDialog()
  }

  const formatDateToMonthYear = (isoString: string | undefined) => {
    console.log(isoString)
    if (!isoString) {
      return 'Invalid date' // Handle undefined or null
    }

    const date = new Date(isoString)
    if (isNaN(date.getTime())) {
      return 'Invalid date' // Handle invalid date strings
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric'
    }).format(date)
  }

  const goToProfile = async (uid: string) => {
    setForumDialog(false)
    navigate(`/profile/${uid}`)
  }

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

  const handleEditProfile = async () => {
    navigate('/settings')
  }

  const test = async () => {
    console.log('logged in user:', loggedInUser)
    console.log('uid:', uid)
    console.log('Profile:', profile)
    console.log('Forums: ', forums)
  }

  return (
    <div
      className={`h-full ${
        isUserExist ? '' : 'flex justify-center items-center'
      }`}
    >
      {isUserExist ? (
        <div className='min-h-full overflow-auto flex justify-center'>
          <div className='w-[50%] box-border p-10 border-l border-r border-gray-200'>
            {/* profile labels */}
            <div className='flex bg-gray-100 rounded p-5'>
              <div className='w-[400px] h-60 flex justify-center items-center'>
                <Avatar
                  onClick={e => e.stopPropagation()}
                  className='w-[200px] h-[200px]'
                >
                  <AvatarImage src={profile.profile_link} />
                  <AvatarFallback>
                    {getInitials(profile.first_name, profile.last_name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className='w-full flex flex-col gap-2 justify-center'>
                <div className='flex gap-4 items-center'>
                  <h1 className='font-semibold text-gray-700 text-lg'>
                    @{profile?.username}
                  </h1>
                  {profile?.uid === loggedInUser?.id && (
                    <Button
                      variant='outline'
                      className='hover:bg-gray-200 text-sm'
                      size='sm'
                      onClick={handleEditProfile}
                    >
                      Edit Profile
                    </Button>
                  )}
                </div>

                <h2 className='font-semibold text-gray-700'>
                  {
                    forums.filter(forum => forum.profiles?.username === uid)
                      .length
                  }{' '}
                  posts
                </h2>

                <h2 className=' text-gray-700'>
                  {profile?.first_name + ' ' + profile?.last_name}
                </h2>
                <h3 className='text-gray-700'>
                  {profile && profile.bio
                    ? profile.bio
                    : 'No description available'}
                </h3>
                <div className='flex items-center mt-4'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    stroke-width='2'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    className='lucide lucide-calendar-days mr-2 h-4 w-4 opacity-70'
                  >
                    <path d='M8 2v4'></path>
                    <path d='M16 2v4'></path>
                    <rect width='18' height='18' x='3' y='4' rx='2'></rect>
                    <path d='M3 10h18'></path>
                    <path d='M8 14h.01'></path>
                    <path d='M12 14h.01'></path>
                    <path d='M16 14h.01'></path>
                    <path d='M8 18h.01'></path>
                    <path d='M12 18h.01'></path>
                    <path d='M16 18h.01'></path>
                  </svg>
                  <h4 className=' text-gray-500' onClick={test}>
                    Joined since{' '}
                    {profile
                      ? formatDateToMonthYear(profile?.created_at)
                      : '2024'}
                  </h4>
                </div>
              </div>
            </div>

            <Separator className='mt-6' />

            {/* my posts */}
            <div className='flex justify-center'>
              <Tabs
                key={uid}
                defaultValue='My Posts'
                className='w-[500px] rounded-none'
              >
                <TabsList className='flex w-full gap-6 bg-transparent rounded-none relative -top-[5px]'>
                  <TabsTrigger
                    value='My Posts'
                    className='transition-none flex gap-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-t-2 
                        border-gray-600 rounded-none data-[state=active]:text-gray-700'
                  >
                    <svg
                      aria-label=''
                      className='x1lliihq x1n2onr6 x5n08af'
                      fill='currentColor'
                      height='12'
                      role='img'
                      viewBox='0 0 24 24'
                      width='12'
                    >
                      <title></title>
                      <rect
                        fill='none'
                        height='18'
                        stroke='currentColor'
                        stroke-linecap='round'
                        stroke-linejoin='round'
                        stroke-width='2'
                        width='18'
                        x='3'
                        y='3'
                      ></rect>
                      <line
                        fill='none'
                        stroke='currentColor'
                        stroke-linecap='round'
                        stroke-linejoin='round'
                        stroke-width='2'
                        x1='9.015'
                        x2='9.015'
                        y1='3'
                        y2='21'
                      ></line>
                      <line
                        fill='none'
                        stroke='currentColor'
                        stroke-linecap='round'
                        stroke-linejoin='round'
                        stroke-width='2'
                        x1='14.985'
                        x2='14.985'
                        y1='3'
                        y2='21'
                      ></line>
                      <line
                        fill='none'
                        stroke='currentColor'
                        stroke-linecap='round'
                        stroke-linejoin='round'
                        stroke-width='2'
                        x1='21'
                        x2='3'
                        y1='9.015'
                        y2='9.015'
                      ></line>
                      <line
                        fill='none'
                        stroke='currentColor'
                        stroke-linecap='round'
                        stroke-linejoin='round'
                        stroke-width='2'
                        x1='21'
                        x2='3'
                        y1='14.985'
                        y2='14.985'
                      ></line>
                    </svg>
                    {uid === loggedInUser?.id
                      ? 'My'
                      : profile && profile.first_name + "'s"}{' '}
                    Posts
                  </TabsTrigger>
                  {(profile.show_upvoted || loggedInUser?.id === profile?.uid) && (
                    <TabsTrigger
                      value='Upvoted Posts'
                      className='transition-none flex gap-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-t-2 
                        border-gray-600 rounded-none data-[state=active]:text-gray-700'
                    >
                      <svg
                        aria-label=''
                        className='x1lliihq x1n2onr6 x1roi4f4'
                        fill='currentColor'
                        height='12'
                        role='img'
                        viewBox='0 0 24 24'
                        width='12'
                      >
                        <title></title>
                        <polygon
                          fill='none'
                          points='20 21 12 13.44 4 21 4 3 20 3 20 21'
                          stroke='currentColor'
                          stroke-linecap='round'
                          stroke-linejoin='round'
                          stroke-width='2'
                        ></polygon>
                      </svg>
                      Upvoted Posts
                    </TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value='My Posts'>
                  <div className='flex flex-col gap-6'>
                    {forums.filter(forum => forum?.profiles?.username === uid)
                      .length === 0 ? (
                      <div className='text-gray-500 mt-10 mx-auto'>
                        {' '}
                        Your forums will show here.{' '}
                      </div>
                    ) : (
                      forums
                        .filter(forum => forum?.profiles?.username === uid)
                        .map(forum => {
                          const isUpvoted =
                            upvoteStates[forum.forum_id] || false
                          const isDownvoted =
                            downvoteStates[forum.forum_id] || false

                          return (
                            <Card
                              key={forum.forum_id}
                              className='w-[500px] max-w-[500px] hover:shadow-lg transition-shadow cursor-pointer'
                              onClick={() => openForumDialog(forum)}
                            >
                              <CardHeader className='relative'>
                                {forum.uid === loggedInUser?.id && (
                                  <div className='absolute top-1 right-3'>
                                    <div className='w-8 h-8 hover:bg-gray-100 rounded-full flex justify-center items-center'>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <div className='flex justify-center items-center gap-3 cursor-pointer'>
                                            <MdMoreHoriz
                                              className='w-6 h-6'
                                              color='gray'
                                            />
                                          </div>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                          className='w-fit'
                                          onClick={e => e.stopPropagation()}
                                        >
                                          <DropdownMenuGroup>
                                            <DropdownMenuItem
                                              onClick={e => {
                                                e.stopPropagation()
                                                openDeletePostDialog(
                                                  forum.forum_id
                                                )
                                              }}
                                              className='cursor-pointer'
                                            >
                                              {/* <UserIcon /> */}
                                              <div>Delete</div>
                                            </DropdownMenuItem>
                                          </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  </div>
                                )}

                                <div className='w-full flex items-center gap-3 cursor-pointer'>
                                  <Avatar
                                    onClick={e => e.stopPropagation()}
                                    className='min-w-[45px] min-h-[45px]'
                                  >
                                    <AvatarImage
                                      src={forum.profiles?.profile_link}
                                    />
                                    <AvatarFallback>
                                      {getInitials(
                                        forum.profiles
                                          ? forum.profiles?.first_name
                                          : '',
                                        forum.profiles
                                          ? forum.profiles?.last_name
                                          : ''
                                      )}
                                    </AvatarFallback>
                                  </Avatar>

                                  <Label
                                    htmlFor=''
                                    className='text-md text-gray-700 cursor-pointer'
                                    onClick={e => e.stopPropagation()}
                                  >
                                    {forum.profiles?.username}
                                  </Label>

                                  {/* <div className="text-sm text-blue-600 relative right-1">•&nbsp;&nbsp;Follow</div> */}

                                  <Label className='text-gray-500 ml-auto'>
                                    {new Date(
                                      forum.date_created
                                    ).toLocaleDateString()}
                                  </Label>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <CardTitle className='text-md text-gray-700'>
                                  {forum.title}
                                </CardTitle>
                                <CardDescription className='mt-2 whitespace-pre-wrap'>
                                  {expandedStates[forum.forum_id]
                                    ? forum.description
                                    : forum.description.slice(0, 100) + '...'}
                                  {forum.description.length > 100 && (
                                    <span
                                      className='text-blue-500 cursor-pointer ml-2'
                                      onClick={e => {
                                        e.stopPropagation()
                                        toggleExpand(forum.forum_id)
                                      }}
                                    >
                                      {expandedStates[forum.forum_id]
                                        ? 'See less'
                                        : 'See more'}
                                    </span>
                                  )}
                                </CardDescription>
                                {forum.links_imgs?.length > 0 && (
                                  <div className='bg-gray-200 flex items-center justify-center mt-4'>
                                    <img
                                      src={forum.links_imgs[0]}
                                      alt={forum.title}
                                      className='w-full h-full object-cover'
                                    />
                                  </div>
                                )}
                              </CardContent>
                              <CardFooter>
                                <div className='flex gap-1'>
                                  <div
                                    className='box-border flex bg-gray-50 border border-gray-200 rounded-full'
                                    onClick={e => e.stopPropagation()}
                                  >
                                    <div
                                      className={`flex-1 flex items-center border-r border-gray-200 hover:bg-gray-100 rounded-tl-full rounded-bl-full gap-1 p-1 px-2 cursor-pointer select-none ${
                                        isUpvoted ? 'bg-green-100' : ''
                                      }`}
                                      onClick={() =>
                                        toggleUpvote(forum.forum_id)
                                      }
                                    >
                                      <svg
                                        width='24'
                                        height='24'
                                        viewBox='0 0 24 24'
                                        xmlns='http://www.w3.org/2000/svg'
                                      >
                                        <path
                                          d='M12 4 3 15h6v5h6v-5h6z'
                                          stroke='#666'
                                          strokeWidth='1.5'
                                          fill={isUpvoted ? '#92c78b' : 'none'}
                                          strokeLinejoin='round'
                                        ></path>
                                      </svg>
                                      <div className='text-sm font-semibold text-gray-700'>
                                        Upvote{' '}
                                        <span className='font-normal text-sm'>
                                          ⧇ {forum.upvotes}
                                        </span>
                                      </div>
                                    </div>
                                    <div
                                      className={`p-1 px-2 hover:bg-gray-100 rounded-tr-full rounded-br-full cursor-pointer select-none ${
                                        isDownvoted ? 'bg-red-100' : ''
                                      }`}
                                      onClick={() =>
                                        toggleDownvote(forum.forum_id)
                                      }
                                    >
                                      <svg
                                        width='24'
                                        height='24'
                                        viewBox='0 0 24 24'
                                        xmlns='http://www.w3.org/2000/svg'
                                      >
                                        <path
                                          d='m12 20 9-11h-6V4H9v5H3z'
                                          stroke='#666'
                                          strokeWidth='1.5'
                                          fill={
                                            isDownvoted ? '#cc4767' : 'none'
                                          }
                                          strokeLinejoin='round'
                                        ></path>
                                      </svg>
                                    </div>
                                  </div>
                                  <div className='box-border flex hover:bg-gray-100 rounded-full'>
                                    <div className='flex items-center gap-1 p-1 cursor-pointer select-none'>
                                      <svg
                                        width='24'
                                        height='24'
                                        viewBox='0 0 24 24'
                                        xmlns='http://www.w3.org/2000/svg'
                                      >
                                        <path
                                          d='M12.071 18.86c4.103 0 7.429-3.102 7.429-6.93C19.5 8.103 16.174 5 12.071 5s-7.429 3.103-7.429 6.93c0 1.291.379 2.5 1.037 3.534.32.501-1.551 3.058-1.112 3.467.46.429 3.236-1.295 3.803-.99 1.09.585 2.354.92 3.701.92Z'
                                          className='icon_svg-stroke icon_svg-fill'
                                          stroke='#666'
                                          strokeWidth='1.5'
                                          fill='none'
                                        ></path>
                                      </svg>
                                      <span className='text-sm font-normal text-gray-700'>
                                        {forum.count_comments}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </CardFooter>
                            </Card>
                          )
                        })
                    )}
                  </div>
                </TabsContent>
                {/* (profile.show_upvoted || uid === loggedInUser?.id) */}
                {(profile.show_upvoted || uid === profile.username) && (
                  <TabsContent value='Upvoted Posts'>
                    <div className='flex flex-col gap-6'>
                      {forums.filter(
                        forum =>
                          openedProfileUserUpvoteStates &&
                          openedProfileUserUpvoteStates.some(
                            votes => forum.forum_id === votes.forum_id
                          )
                      ).length === 0 ? (
                        <div className='text-gray-500 mt-10 mx-auto'>
                          {' '}
                          Your upvoted forums will show here.{' '}
                        </div>
                      ) : (
                        forums
                          .filter(
                            forum =>
                              openedProfileUserUpvoteStates &&
                              openedProfileUserUpvoteStates.some(
                                votes => forum.forum_id === votes.forum_id
                              )
                          )
                          .map(forum => {
                            const isUpvoted =
                              upvoteStates[forum.forum_id] || false
                            const isDownvoted =
                              downvoteStates[forum.forum_id] || false

                            return (
                              <Card
                                key={forum.forum_id}
                                className='w-[500px] max-w-[500px] hover:shadow-lg transition-shadow cursor-pointer'
                                onClick={() => openForumDialog(forum)}
                              >
                                <CardHeader className='relative'>
                                  {forum.uid === loggedInUser?.id && (
                                    <div className='absolute top-1 right-3'>
                                      <div className='w-8 h-8 hover:bg-gray-100 rounded-full flex justify-center items-center'>
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <div className='flex justify-center items-center gap-3 cursor-pointer'>
                                              <MdMoreHoriz
                                                className='w-6 h-6'
                                                color='gray'
                                              />
                                            </div>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent
                                            className='w-fit'
                                            onClick={e => e.stopPropagation()}
                                          >
                                            <DropdownMenuGroup>
                                              <DropdownMenuItem
                                                onClick={e => {
                                                  e.stopPropagation()
                                                  openDeletePostDialog(
                                                    forum.forum_id
                                                  )
                                                }}
                                                className='cursor-pointer'
                                              >
                                                {/* <UserIcon /> */}
                                                <div>Delete</div>
                                              </DropdownMenuItem>
                                            </DropdownMenuGroup>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </div>
                                    </div>
                                  )}

                                  <div className='w-full flex items-center gap-3 cursor-pointer'>
                                    <Avatar
                                      onClick={e => {
                                        e.stopPropagation()
                                        goToProfile(
                                          forum && forum.profiles
                                            ? forum.profiles?.username
                                            : ''
                                        )
                                      }}
                                      className='min-w-[45px] min-h-[45px]'
                                    >
                                      <AvatarImage
                                        src={forum.profiles?.profile_link}
                                      />
                                      <AvatarFallback>
                                        {getInitials(
                                          forum.profiles
                                            ? forum.profiles?.first_name
                                            : '',
                                          forum.profiles
                                            ? forum.profiles?.last_name
                                            : ''
                                        )}
                                      </AvatarFallback>
                                    </Avatar>

                                    <Label
                                      htmlFor=''
                                      className='text-md text-gray-700 cursor-pointer'
                                      onClick={e => {
                                        e.stopPropagation()
                                        goToProfile(
                                          forum && forum.profiles
                                            ? forum.profiles?.username
                                            : ''
                                        )
                                      }}
                                    >
                                      {forum.profiles?.username}
                                    </Label>

                                    {/* <div className="text-sm text-blue-600 relative right-1">•&nbsp;&nbsp;Follow</div> */}

                                    <Label className='text-gray-500 ml-auto'>
                                      {new Date(
                                        forum.date_created
                                      ).toLocaleDateString()}
                                    </Label>
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <CardTitle className='text-md text-gray-700'>
                                    {forum.title}
                                  </CardTitle>
                                  <CardDescription className='mt-2 whitespace-pre-wrap'>
                                    {expandedStates[forum.forum_id]
                                      ? forum.description
                                      : forum.description.slice(0, 100) + '...'}
                                    {forum.description.length > 100 && (
                                      <span
                                        className='text-blue-500 cursor-pointer ml-2'
                                        onClick={e => {
                                          e.stopPropagation()
                                          toggleExpand(forum.forum_id)
                                        }}
                                      >
                                        {expandedStates[forum.forum_id]
                                          ? 'See less'
                                          : 'See more'}
                                      </span>
                                    )}
                                  </CardDescription>
                                  {forum.links_imgs?.length > 0 && (
                                    <div className='bg-gray-200 flex items-center justify-center mt-4'>
                                      <img
                                        src={forum.links_imgs[0]}
                                        alt={forum.title}
                                        className='w-full h-full object-cover'
                                      />
                                    </div>
                                  )}
                                </CardContent>
                                <CardFooter>
                                  <div className='flex gap-1'>
                                    <div
                                      className='box-border flex bg-gray-50 border border-gray-200 rounded-full'
                                      onClick={e => e.stopPropagation()}
                                    >
                                      <div
                                        className={`flex-1 flex items-center border-r border-gray-200 hover:bg-gray-100 rounded-tl-full rounded-bl-full gap-1 p-1 px-2 cursor-pointer select-none ${
                                          isUpvoted ? 'bg-green-100' : ''
                                        }`}
                                        onClick={() =>
                                          toggleUpvote(forum.forum_id)
                                        }
                                      >
                                        <svg
                                          width='24'
                                          height='24'
                                          viewBox='0 0 24 24'
                                          xmlns='http://www.w3.org/2000/svg'
                                        >
                                          <path
                                            d='M12 4 3 15h6v5h6v-5h6z'
                                            stroke='#666'
                                            strokeWidth='1.5'
                                            fill={
                                              isUpvoted ? '#92c78b' : 'none'
                                            }
                                            strokeLinejoin='round'
                                          ></path>
                                        </svg>
                                        <div className='text-sm font-semibold text-gray-700'>
                                          Upvote{' '}
                                          <span className='font-normal text-sm'>
                                            ⧇ {forum.upvotes}
                                          </span>
                                        </div>
                                      </div>
                                      <div
                                        className={`p-1 px-2 hover:bg-gray-100 rounded-tr-full rounded-br-full cursor-pointer select-none ${
                                          isDownvoted ? 'bg-red-100' : ''
                                        }`}
                                        onClick={() =>
                                          toggleDownvote(forum.forum_id)
                                        }
                                      >
                                        <svg
                                          width='24'
                                          height='24'
                                          viewBox='0 0 24 24'
                                          xmlns='http://www.w3.org/2000/svg'
                                        >
                                          <path
                                            d='m12 20 9-11h-6V4H9v5H3z'
                                            stroke='#666'
                                            strokeWidth='1.5'
                                            fill={
                                              isDownvoted ? '#cc4767' : 'none'
                                            }
                                            strokeLinejoin='round'
                                          ></path>
                                        </svg>
                                      </div>
                                    </div>
                                    <div className='box-border flex hover:bg-gray-100 rounded-full'>
                                      <div className='flex items-center gap-1 p-1 cursor-pointer select-none'>
                                        <svg
                                          width='24'
                                          height='24'
                                          viewBox='0 0 24 24'
                                          xmlns='http://www.w3.org/2000/svg'
                                        >
                                          <path
                                            d='M12.071 18.86c4.103 0 7.429-3.102 7.429-6.93C19.5 8.103 16.174 5 12.071 5s-7.429 3.103-7.429 6.93c0 1.291.379 2.5 1.037 3.534.32.501-1.551 3.058-1.112 3.467.46.429 3.236-1.295 3.803-.99 1.09.585 2.354.92 3.701.92Z'
                                            className='icon_svg-stroke icon_svg-fill'
                                            stroke='#666'
                                            strokeWidth='1.5'
                                            fill='none'
                                          ></path>
                                        </svg>
                                        <span className='text-sm font-normal text-gray-700'>
                                          {forum.count_comments}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </CardFooter>
                              </Card>
                            )
                          })
                      )}
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </div>
          </div>

          <AlertDialog
            open={forumDialog}
            onOpenChange={isOpen => {
              setForumDialog(isOpen)

              // Run custom logic only when the dialog closes
              if (!isOpen) {
                closeForumDialog()
              }
            }}
          >
            <AlertDialogContent className='w-[70%] min-w-[1400px] h-[90%] z-[9998] p-0 border-none pointer-events-none'>
              <AlertDialogCancel
                onClick={closeForumDialog}
                className='border border-gray-500 fixed top-4 left-4 z-[20] bg-gray-100 hover:bg-gray-200 rounded-full font-bold text-gray-700 w-[50px] h-[50px] flex justify-center items-center'
              >
                X
              </AlertDialogCancel>

              <div className='w-full h-full max-h-full overflow-auto flex rounded-md'>
                <div className='w-[70%] h-full rounded-md bg-gray-200'>
                  <img
                    src={
                      openedForumData?.links_imgs?.[0] ||
                      'https://via.placeholder.com/600?text=No+Image+Available'
                    }
                    alt={openedForumData?.title || 'No title available'}
                    className={`w-full h-full ${
                      openedForumData?.links_imgs?.[0] ? 'object-contain' : ''
                    } rounded-md`}
                  />
                </div>

                <div className='w-[30%] h-full max-h-full overflow-auto p-6 relative'>
                  <div className='flex gap-2 items-center'>
                    <Avatar
                      onClick={e => {
                        e.stopPropagation()
                        navigate(
                          `/profile/${openedForumData?.profiles?.username}`
                        )
                        closeForumDialog()
                      }}
                      className='cursor-pointer min-w-[45px] min-h-[45px]'
                    >
                      <AvatarImage
                        src={
                          openedForumData
                            ? openedForumData.profiles?.profile_link
                            : ''
                        }
                      />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <Label
                      htmlFor=''
                      className='text-md text-gray-700 cursor-pointer'
                      onClick={e => {
                        e.stopPropagation()
                        navigate(
                          `/profile/${openedForumData?.profiles?.username}`
                        )
                        closeForumDialog()
                      }}
                    >
                      {openedForumData?.profiles?.username}
                    </Label>
                    <Label className='text-gray-500 ml-auto'>
                      {openedForumData?.date_created
                        ? new Date(
                            openedForumData.date_created
                          ).toLocaleDateString()
                        : 'Unknown date'}
                    </Label>
                  </div>

                  <div className='mt-4'>
                    <div className='text-md font-semibold text-gray-800 mb-4'>
                      {openedForumData?.title}
                    </div>
                    <div className='text-sm text-gray-600 leading-relaxed whitespace-pre-wrap'>
                      {openedForumData?.description}
                    </div>

                    <Separator className='mt-4' />

                    <div className='mt-4'>
                      <div className='flex w-fit border rounded-full'>
                        <div
                          className={`flex-1 flex items-center border-r border-gray-200 hover:bg-gray-100 rounded-tl-full rounded-bl-full gap-1 p-1 px-2 cursor-pointer select-none 
                                            ${
                                              upvoteStates[
                                                openedForumData?.forum_id || 1
                                              ]
                                                ? 'bg-green-100'
                                                : ''
                                            }`}
                          onClick={() =>
                            toggleUpvote(openedForumData?.forum_id || '1')
                          }
                        >
                          <svg
                            width='24'
                            height='24'
                            viewBox='0 0 24 24'
                            xmlns='http://www.w3.org/2000/svg'
                          >
                            <path
                              d='M12 4 3 15h6v5h6v-5h6z'
                              stroke='#666'
                              strokeWidth='1.5'
                              // fill={isUpvoted ? "#92c78b" : "none"}
                              fill={
                                upvoteStates[openedForumData?.forum_id || 1]
                                  ? '#92c78b'
                                  : 'none'
                              }
                              strokeLinejoin='round'
                            ></path>
                          </svg>
                          <div className='text-sm font-semibold text-gray-700'>
                            Upvote{' '}
                            <span className='font-normal text-sm'>
                              ⧇ {openedForumData?.upvotes}
                            </span>
                          </div>
                        </div>
                        <div
                          className={`p-1 px-2 hover:bg-gray-100 rounded-tr-full rounded-br-full cursor-pointer select-none 
                                                                ${
                                                                  downvoteStates[
                                                                    openedForumData?.forum_id ||
                                                                      1
                                                                  ]
                                                                    ? 'bg-red-100'
                                                                    : ''
                                                                }`}
                          onClick={() =>
                            toggleDownvote(openedForumData?.forum_id || '1')
                          }
                        >
                          <svg
                            width='24'
                            height='24'
                            viewBox='0 0 24 24'
                            xmlns='http://www.w3.org/2000/svg'
                          >
                            <path
                              d='m12 20 9-11h-6V4H9v5H3z'
                              stroke='#666'
                              strokeWidth='1.5'
                              fill={
                                downvoteStates[openedForumData?.forum_id || 1]
                                  ? '#cc4767'
                                  : 'none'
                              }
                              strokeLinejoin='round'
                            ></path>
                          </svg>
                        </div>
                      </div>
                    </div>

                    <Separator className='mt-4' />

                    <div className='w-full flex flex-col gap-4 mt-4 mb-3'>
                      {openedForumComments?.map(
                        (comment: any, index: number) => (
                          <div
                            key={comment.comment_id}
                            className={`flex flex-col ${
                              index == 0 &&
                              searchParams.get('comment_id') ===
                                comment.comment_id
                                ? 'border-gray-200 border shadow-sm p-3 box-border bg-gray-50'
                                : ''
                            }`}
                          >
                            <div className='flex gap-4 qwe rrrrrrrrrrrrw-full'>
                              {/* Avatar */}
                              <Avatar
                                onClick={e => {
                                  e.stopPropagation()
                                  navigate(`/profile/${comment.username}`)
                                  closeForumDialog()
                                }}
                                className='flex-shrink-0 cursor-pointer min-w-[45px] min-h-[45px]'
                              >
                                <AvatarImage
                                  src={
                                    forums.find(
                                      forum => forum.uid === comment.uid
                                    )?.profiles?.profile_link
                                  }
                                />
                                <AvatarFallback className=''>
                                  {getInitials(
                                    comment.first_name,
                                    comment.last_name
                                  )}
                                </AvatarFallback>
                              </Avatar>

                              {/* Comment Content */}
                              <div className='flex flex-col bg-gray-100 relative rounded p-3 break-words max-w-full overflow-auto'>
                                {/* User Name */}
                                <Label
                                  htmlFor=''
                                  className='text-md text-gray-700 cursor-pointer'
                                  onClick={e => {
                                    e.stopPropagation()
                                    navigate(`/profile/${comment.username}`)
                                    closeForumDialog()
                                  }}
                                >
                                  {comment.username}
                                </Label>

                                {/* Comment Text */}
                                <h2 className='text-gray-700 text-[.9rem]'>
                                  {comment.content}
                                </h2>
                              </div>
                            </div>

                            {/* Date and Reply */}
                            <div className='ml-auto flex items-center gap-3'>
                              <Label className='text-gray-500'>
                                {new Date(
                                  comment.date_created
                                ).toLocaleDateString()}
                              </Label>

                              {/* <Button className="text-gray-700 m-0 p-0" variant="link">
                                                    Reply
                                                </Button> */}

                              {/* Conditionally show Delete button only for the logged-in user's comments */}
                              {comment.uid === loggedInUser?.id && (
                                <Button
                                  className='text-red-600 m-0 p-0'
                                  variant='link'
                                  onClick={() =>
                                    openDeleteCommentDialog(comment.comment_id)
                                  }
                                >
                                  Delete
                                </Button>
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className='w-[390px] h-24 sticky -bottom-6 bg-white -mb-6 -ml-6 -mr-6 px-3 pb-3 box-content'>
                    <Textarea
                      className='bg-gray-50 h-full resize-none shadow-sm'
                      placeholder={
                        loggedInUser
                          ? 'Comment as ' +
                            loggedInUser?.user_metadata.displayName
                          : 'Login to comment'
                      }
                      required
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                    />

                    <div
                      className='absolute right-5 bottom-5 cursor-pointer hover:bg-gray-200 w-10 h-10 rounded-full flex justify-center items-center'
                      onClick={handleComment}
                    >
                      <FaPaperPlane
                        className='absolute w-5 h-5'
                        color='#3285a8'
                      />
                    </div>
                  </div>
                </div>
              </div>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={deleteCommentDialog}>
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
      ) : (
        <div className='flex justify-center items-center text-gray-500 text-xl'>
          {' '}
          This user doesn't exist{' '}
        </div>
      )}
    </div>
  )
}

export default Profile
