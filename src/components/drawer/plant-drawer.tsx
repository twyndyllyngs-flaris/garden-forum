

import { useState, useEffect } from "react"; // Import useState
import { supabase } from "../../config/supabase/supabaseClient"; // Adjust the import path as needed
import '../../styling/output.css';

//components

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "../ui/sheet"
import { Button } from "../ui/button"

  // objects
interface Item {
    title: string;
    description: string;
    link?: string; // Optional link field
}

type MyComponentProps = {
    isDrawerOpen: boolean;
    plantData: Item | null;
    closeDrawer: () => void
};

function PlantDrawer({ isDrawerOpen, plantData, closeDrawer }: MyComponentProps) {
     
    return (
        <div className="">
            <Sheet open={isDrawerOpen}>
                <SheetContent side={"bottom"} className="w-screen h-screen">
                    {/* header */}
                    <div className="flex justify-between items-center sticky top-0">
                        <Button variant="outline" className="self-start" onClick={closeDrawer}>Close</Button>
                        <div className="flex-1 text-center text-2xl">
                            {plantData?.title}
                        </div>
                    </div>
                    
                    {/* main */}
                    <div className="w-[75%] h-full m-auto mt-[100px]">

                        <div className="w-full flex justify-between items-center gap-28">
                            <div className="w-[60%] text-md text-center leading-[2.5rem] text-gray-600">
                                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ipsam eveniet minus, architecto exercitationem voluptatem ea maiores qui deserunt, nobis sunt dolor dicta et laboriosam minima quo reiciendis rerum quos nihil dolorum! Illo perferendis enim dignissimos accusantium! Vitae obcaecati ex, deleniti sequi minus distinctio esse odio impedit ad placeat nihil exercitationem voluptatum eius veniam autem iste atque, ipsa hic, dolor recusandae sed quis consequatur? Ipsum dolore dicta ducimus odio nisi, sapiente porro, nemo corrupti enim aspernatur eius impedit tenetur minima repellendus vel fuga commodi laboriosam consequatur eligendi iure. Amet numquam ab voluptatem quidem reprehenderit laborum qui enim sequi maiores, et cum?
                            </div>
                            <div className="w-[40%] h-[300px] bg-gray-200">
                                {/* Image placeholder */}
                            </div>
                        </div>

                    </div>
                </SheetContent>
            </Sheet>

        </div>
    );
}

export default PlantDrawer;
