import { Dispatch, SetStateAction } from 'react'
import { useEffect, useState } from 'react'
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
  } from '../ui/tooltip'

interface GuidesSidebarProps {
  setSearchTerm: Dispatch<SetStateAction<string>>
  setSortBy: Dispatch<SetStateAction<'name' | 'category'>>
  setIsAscending: Dispatch<SetStateAction<boolean>> // New prop for sort order
}

function GuidesSidebar ({
  setSearchTerm,
  setSortBy,
  setIsAscending
}: GuidesSidebarProps) {

    const [isTooltipOpen, setTooltipOpen] = useState(false)
    
      const showTooltip = () => setTooltipOpen(true)
      const hideTooltip = () => setTooltipOpen(false)

  return (
    <div className='w-[300px] min-w-[300px] h-full bg-gray-50 border-r border-gray-300 sticky top-0 p-6'>
      <div className='text-xl font-bold text-gray-800'>Gardening Guides</div>

      <Separator className='my-6' />

      <div className='mt-4 flex flex-col gap-3'>
        <div className='text-sm text-gray-700'>Filters</div>

        <Input
          placeholder='Search for plant'
          className='rounded-full'
          onChange={e => setSearchTerm(e.target.value)}
        />

        <Select
          defaultValue='name'
          onValueChange={value => setSortBy(value as 'name' | 'category')}
        >
          <SelectTrigger className='rounded-full'>
            <SelectValue
              placeholder='Sort by'
              className='placeholder:text-white font-bold'
            />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Sort by</SelectLabel>
              <SelectItem value='name'>Name</SelectItem>
              <SelectItem value='category'>Category</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <div className='flex items-center space-x-2'>
          <Switch
            id='airplane-mode'
            defaultChecked // Set switch to default checked (ascending)
            onCheckedChange={checked => setIsAscending(checked)} // Update state based on switch
          />
          <Label htmlFor='airplane-mode' className='text-gray-700'>
            Ascending
          </Label>
        </div>
      </div>

      <Separator className='my-6' />

      <TooltipProvider>
        <Tooltip open={isTooltipOpen}>
          <TooltipTrigger asChild>
            <div className='mt-4 flex flex-col gap-3'>
              <div className='text-sm text-gray-700'>Categories</div>

              <div className='flex flex-col gap-1'>
                <Label
                  className='rounded-xl hover:bg-gray-100 py-2 px-4 text-[.9rem] text-gray-700 cursor-pointer'
                  onClick={showTooltip}
                  onMouseEnter={showTooltip}
                  onMouseLeave={hideTooltip}
                >
                  Category 1
                </Label>
                <Label
                  className='rounded-xl hover:bg-gray-100 py-2 px-4 text-[.9rem] text-gray-700 cursor-pointer'
                  onClick={showTooltip}
                  onMouseEnter={showTooltip}
                  onMouseLeave={hideTooltip}
                >
                  Category 2
                </Label>
                <Label
                  className='rounded-xl hover:bg-gray-100 py-2 px-4 text-[.9rem] text-gray-700 cursor-pointer'
                  onClick={showTooltip}
                  onMouseEnter={showTooltip}
                  onMouseLeave={hideTooltip}
                >
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

export default GuidesSidebar
