import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import '../../styling/output.css'
import 'non.geist'

// Components
import { Input } from '../ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '../ui/select'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { Separator } from '../ui/seperator'
import { Button } from '../ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '../ui/tooltip'

// interface
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
  } | null
}

type MyComponentProps = {
  openCreateSpace: () => void
  closeCreateSpace: () => void
  orderForumByRelevance: () => void
  orderForumByDate: () => void
  showForumsWithTitle: (title: string) => void
  forums: any
}

function ForumsSidebar ({
  openCreateSpace,
  closeCreateSpace,
  orderForumByRelevance,
  orderForumByDate,
  showForumsWithTitle,
  forums
}: MyComponentProps) {
  const [searchValue, setSearchValue] = useState('')
  const [sortByValue, setSortByValue] = useState('Recent')

  const [isTooltipOpen, setTooltipOpen] = useState(false)

  const showTooltip = () => setTooltipOpen(true)
  const hideTooltip = () => setTooltipOpen(false)

  const setSortBy = async (sortBy: string) => {
    setSortByValue(sortBy)

    if (sortBy === 'Relevance') {
      orderForumByRelevance()
    } else if (sortBy === 'Recent') {
      orderForumByDate()
    }
  }

  const searchForum = async (title: string) => {
    setSearchValue(title)
    showForumsWithTitle(title)
  }

  useEffect(() => {
    setSortByValue(sortByValue)
    searchForum(searchValue)
  }, [forums])

  return (
    <div className='w-[250px] h-full border-r border-gray-300 p-6 sticky top-0'>
      <div className='text-xl font-bold text-gray-800'>Forums</div>

      <Button className='mt-3' onClick={openCreateSpace}>
        {' '}
        + Create Space{' '}
      </Button>

      <Separator className='my-6' />

      <div className='mt-4 flex flex-col gap-3'>
        <div className='text-sm text-gray-700'>Search</div>

        <Input
          placeholder='Search title'
          className='rounded-full'
          onChange={e => searchForum(e.target.value)}
        />

        <Select defaultValue='Recent' onValueChange={value => setSortBy(value)}>
          <SelectTrigger className='rounded-full'>
            <SelectValue
              placeholder='Sort by'
              className='placeholder:text-white font-bold'
            />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Sort by</SelectLabel>
              <SelectItem value='Recent'>Recent</SelectItem>
              <SelectItem value='Relevance'>Relevance</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* <div className="flex items-center space-x-2">
                    <Switch
                        id="airplane-mode"
                        defaultChecked // Set switch to default checked (ascending)
                        //onCheckedChange={(checked) => setIsAscending(checked)} // Update state based on switch
                    />
                    <Label htmlFor="airplane-mode" className="text-gray-700">Ascending</Label>
                </div> */}
      </div>

      <Separator className='my-6' />

      <TooltipProvider>
        <Tooltip open={isTooltipOpen}>
          <TooltipTrigger asChild>
            <div className='mt-4 flex flex-col gap-3'>
              <div className='text-sm text-gray-700'>Categories</div>

              <div className='flex flex-col gap-1'>
                <Label className='rounded-xl hover:bg-gray-100 py-2 px-4 text-[.9rem] text-gray-700 cursor-pointer' 
                onClick={showTooltip} onMouseEnter={showTooltip} onMouseLeave={hideTooltip}>
                  Category 1
                </Label>
                <Label className='rounded-xl hover:bg-gray-100 py-2 px-4 text-[.9rem] text-gray-700 cursor-pointer'
                onClick={showTooltip} onMouseEnter={showTooltip} onMouseLeave={hideTooltip}>
                  Category 2
                </Label>
                <Label className='rounded-xl hover:bg-gray-100 py-2 px-4 text-[.9rem] text-gray-700 cursor-pointer'
                onClick={showTooltip} onMouseEnter={showTooltip} onMouseLeave={hideTooltip}>
                  Category 3
                </Label>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>This component is under development</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

export default ForumsSidebar
