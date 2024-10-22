import { useEffect } from "react"; // Import useState
import { supabase } from "../../config/supabase/supabaseClient"; // Adjust the import path as needed
import '../../styling/output.css';

//components
import { Input } from "../ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  } from "../ui/select"
import { Label } from "../ui/label"
import { Switch } from "../ui/switch"
import { Separator } from "../ui/seperator"


function GuidesSidebar() {  return (
    <div className="w-[300px] h-full bg-gray-50 border-r border-gray-300 sticky p-6">
        <div className="text-xl font-bold text-gray-800">
          Gardening Guides
        </div>

        <Separator className="my-6" />

        <div className="mt-4 flex flex-col gap-3">
            <div className="text-gray-800 font-semibold">
                Filters
            </div>

            <Input placeholder="Search for plant" className="rounded-full"/>

            <Select>
                <SelectTrigger className="rounded-full">
                    <SelectValue placeholder="Sort by" className="placeholder:text-white font-bold"/>
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                    <SelectLabel>Sort by</SelectLabel>
                    <SelectItem value="apple">Name</SelectItem>
                    <SelectItem value="banana">Category</SelectItem>
                    <SelectItem value="blueberry">Environment</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
                <Switch id="airplane-mode" />
                <Label htmlFor="airplane-mode">Ascending</Label>
            </div>
        </div>

        <Separator className="my-6" />

        <div className="mt-4 flex flex-col gap-2">
            <div className="text-gray-800 font-semibold">
                Categories
            </div>

            <div className="rounded-xl hover:bg-gray-100 py-2 px-4 text-[.9rem] text-gray-700 cursor-pointer font-normal"> Category1</div>
            <div className="rounded-xl hover:bg-gray-100 py-2 px-4 text-[.9rem] text-gray-700 cursor-pointer "> Category2</div>
            <div className="rounded-xl hover:bg-gray-100 py-2 px-4 text-[.9rem] text-gray-700 cursor-pointer "> Category3</div>
            <div className="rounded-xl hover:bg-gray-100 py-2 px-4 text-[.9rem] text-gray-700 cursor-pointer "> Category4</div>
        </div>
    </div>
  );
}

export default GuidesSidebar;
