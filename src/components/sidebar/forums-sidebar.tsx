import { Dispatch, SetStateAction } from "react";
import '../../styling/output.css';
import "non.geist"

// Components
import { Input } from "../ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Separator } from "../ui/seperator";
import { Button } from "../ui/button";

type MyComponentProps = {
    openCreateSpace: () => void
    closeCreateSpace: () => void
};

function ForumsSidebar({ openCreateSpace, closeCreateSpace }: MyComponentProps) {
    return (
        <div className="w-[250px] h-full border-r border-gray-300 p-6 sticky top-0">
            <div className="text-xl font-bold text-gray-800">
                Forums
            </div>

            <Button className="mt-3" onClick={openCreateSpace}> + Create Space </Button>

            <Separator className="my-6" />

            <div className="mt-4 flex flex-col gap-3">
                <div className="text-sm text-gray-700">Search</div>

                <Input
                    placeholder="Search title"
                    className="rounded-full"
                    //onChange={(e) => setSearchTerm(e.target.value)}
                />

                <Select defaultValue="name" /*onValueChange={(value) => setSortBy(value as "name" | "category")}*/>
                    <SelectTrigger className="rounded-full">
                        <SelectValue placeholder="Sort by" className="placeholder:text-white font-bold" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Sort by</SelectLabel>
                            <SelectItem value="name">Recent</SelectItem>
                            <SelectItem value="category">Relevance</SelectItem>
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

            <Separator className="my-6" />

            <div className="mt-4 flex flex-col gap-3">
                <div className="text-sm text-gray-700">Categories</div>

                <div className="flex flex-col gap-1">
                    <Label className="rounded-xl hover:bg-gray-100 py-2 px-4 text-[.9rem] text-gray-700 cursor-pointer">
                        Category 1
                    </Label>
                    <Label className="rounded-xl hover:bg-gray-100 py-2 px-4 text-[.9rem] text-gray-700 cursor-pointer">
                        Category 2
                    </Label>
                    <Label className="rounded-xl hover:bg-gray-100 py-2 px-4 text-[.9rem] text-gray-700 cursor-pointer">
                        Category 3
                    </Label>
                </div>
            </div>
        </div>
    );
}

export default ForumsSidebar;
