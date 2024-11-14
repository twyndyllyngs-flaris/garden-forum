import { useEffect } from "react"; // Import useState
import { supabase } from "../config/supabase/supabaseClient"; // Adjust the import path as needed
import { Link, useNavigate } from "react-router-dom"; // Import from react-router-dom
import '../styling/output.css';
import "non.geist"

//components
import Navbar from "../components/navbar/navbar";
import Guides from "./guides";
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
  LogOut,
  Settings,
  User as UserIcon,
} from "lucide-react";

function Forum() {  
    const navigate = useNavigate();

    return (
        <div className="w-[1400px] ml-auto flex">
            <ForumsSidebar />
             
            {/* main */}
            <div className="w-full h-full max-h-screen box-border p-3 overflow-scroll">
                <Card
                    // key={plant.plant_id}
                    className="mb-4 w-[500px] max-w-[500] hover:shadow-lg transition-shadow cursor-pointer"
                    // onClick={() => openDrawer(plant)}
                    >
                    <CardHeader>
                        <div className="w-full flex items-center gap-3 cursor-pointer">
                            <Avatar>
                                <AvatarImage src="https://github.com/shadcn.png" />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                            <Label htmlFor="" className="text-md text-gray-700 cursor-pointer">
                                Ralph Matthew De Leon
                            </Label>
                            <Label className="text-gray-500 ml-auto">
                                Nov 11
                            </Label>
                        </div>
                      
                        
                    </CardHeader>
                    <CardContent className="">
                        <CardTitle className="text-md text-gray-700">Lorem ipsum dolor, sit amet consectetur adipisicing.</CardTitle>
                        <CardDescription className="mt-2">Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente cum sunt, neque cumque exercitationem dolor saepe, quia sed eligendi, maxime quasi voluptatibus necessitatibus! Recusandae ab doloribus sint quas nostrum unde enim, minus quibusdam adipisci sequi similique distinctio tempore veritatis itaque possimus quis commodi ipsum neque est asperiores. Reprehenderit, quisquam aliquid.</CardDescription>
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center mt-4">
                            <img
                                //src={plant.images_links[0]}
                                //alt={plant.plant_name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </CardContent>
                    <CardFooter>

                    </CardFooter>
                </Card>      
                <Card
                    // key={plant.plant_id}
                    className="mb-4 w-[500px] max-w-[500] hover:shadow-lg transition-shadow cursor-pointer"
                    // onClick={() => openDrawer(plant)}
                    >
                    <CardHeader>
                        <div className="w-full flex items-center gap-3 cursor-pointer">
                            <Avatar>
                                <AvatarImage src="https://github.com/shadcn.png" />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                            <Label htmlFor="" className="text-md text-gray-700 cursor-pointer">
                                Ralph Matthew De Leon
                            </Label>
                            <Label className="text-gray-500 ml-auto">
                                Nov 11
                            </Label>
                        </div>
                      
                        
                    </CardHeader>
                    <CardContent className="">
                        <CardTitle className="text-md text-gray-700">Lorem ipsum dolor, sit amet consectetur adipisicing.</CardTitle>
                        <CardDescription className="mt-2">Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente cum sunt, neque cumque exercitationem dolor saepe, quia sed eligendi, maxime quasi voluptatibus necessitatibus! Recusandae ab doloribus sint quas nostrum unde enim, minus quibusdam adipisci sequi similique distinctio tempore veritatis itaque possimus quis commodi ipsum neque est asperiores. Reprehenderit, quisquam aliquid.</CardDescription>
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center mt-4">
                            <img
                                //src={plant.images_links[0]}
                                //alt={plant.plant_name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </CardContent>
                    <CardFooter>

                    </CardFooter>
                </Card>                          
            </div>

        </div>
    );
}

export default Forum;
