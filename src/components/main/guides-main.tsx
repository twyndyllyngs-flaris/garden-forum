import { useState, useEffect } from "react";
import { supabase } from "../../config/supabase/supabaseClient"; // Adjust the import path as needed
import { Link } from "react-router-dom"; // Import Link
import '../../styling/output.css';
import 'non.geist'

// components
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../ui/card";
import { Separator } from "../ui/seperator";
import PlantDrawer from "../drawer/plant-drawer";

// objects
interface Item {
    title: string;
    description: string;
    link?: string; // Optional link field
}
interface Category {
    [categoryName: string]: Item[];
}

const categories: Category = {
    "Category 1": [
        {
            title: "Item 1",
            description: "This is the first item in Category 1.",
            link: "/category1/item1", // Replace with actual route
        },
        {
            title: "Item 2",
            description: "This is the second item in Category 1.",
            link: "/category1/item2",
        },
        {
            title: "Item 3",
            description: "This is the third item in Category 1.",
            link: "/category1/item3",
        },
        {
            title: "Item 4",
            description: "This is the fourth item in Category 1.",
            link: "/category1/item4",
        },
    ],
    "Category 2": [
        {
            title: "Item 1",
            description: "This is the first item in Category 2.",
            link: "/category2/item1",
        },
        {
            title: "Item 2",
            description: "This is the second item in Category 2.",
            link: "/category2/item2",
        },
        {
            title: "Item 3",
            description: "This is the third item in Category 2.",
            link: "/category2/item3",
        },
        {
            title: "Item 4",
            description: "This is the fourth item in Category 2.",
            link: "/category2/item4",
        },
    ],
    "Category 3": [
        {
            title: "Item 1",
            description: "This is the first item in Category 3.",
            link: "/category3/item1",
        },
        {
            title: "Item 2",
            description: "This is the second item in Category 3.",
            link: "/category3/item2",
        },
        {
            title: "Item 3",
            description: "This is the third item in Category 3.",
            link: "/category3/item3",
        },
        {
            title: "Item 4",
            description: "This is the fourth item in Category 3.",
            link: "/category3/item4",
        },
    ],
};

function GuidesMain() {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false); 
    const [plantData, setPlantData] = useState<Item|null>(null); 

    const openDrawer = (item : Item): void => {
        setIsDrawerOpen(true);
        setPlantData(item)
    }

    const closeDrawer = ():void => {
        setIsDrawerOpen(false)
    }

    return (
        <div className="flex-1 h-fit p-10 box-border">
            <PlantDrawer isDrawerOpen={isDrawerOpen} plantData={plantData} closeDrawer={closeDrawer}/>

            <div className="">
                {Object.entries(categories).map(([categoryName, items], index) => (
                    <div key={categoryName}>
                        {/* Category Title */}
                        <h2 className="text-md mb-6 text-gray-600">{categoryName}</h2>

                        {/* Cards Grid */}
                        <div className="grid grid-cols-4">
                            {items.map((item, itemIndex) => (
                                <Card key={itemIndex} className="mb-4 w-[350px] hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openDrawer(item)}>
                                    <CardHeader>
                                        <CardTitle className="text-xl text-gray-700">{item.title}</CardTitle>
                                        <CardDescription>{item.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                                            {/* Image placeholder */}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Separator */}
                        {index < Object.entries(categories).length - 1 && (
                            <Separator className="my-8" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default GuidesMain;
