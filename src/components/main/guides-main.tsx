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
import { Box, Step, StepLabel, Stepper } from "@mui/material"; // Import MUI components

// objects
interface Plant {
    plant_id: string; // Assuming plant_id is a string type
    plant_category_id: number; // Assuming plant_category_id is a number
    plant_name: string;
    description_short: string;
    description_long: string;
    steps: { [key: string]: string }; // Adjust as per your actual data type
    faq: { [key: string]: string }; // Adjust as per your actual data type
    images_links: string[]; // Assuming images_links is an array of strings
}

function GuidesMain() {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [plants, setPlants] = useState<Plant[]>([]);
    const [plantData, setPlantData] = useState<Plant | null>(null);

    const fetchPlants = async () => {
        const { data, error } = await supabase
            .from("plants")
            .select("*"); // Fetch all columns from the plants table

        if (error) {
            console.error("Error fetching plants:", error);
        } else {
            setPlants(data);
        }
    };

    useEffect(() => {
        fetchPlants();
    }, []);

    const openDrawer = (plant: Plant): void => {
        setIsDrawerOpen(true);
        setPlantData(plant);
    };

    const closeDrawer = (): void => {
        setIsDrawerOpen(false);
    };

    // Group plants by category
    const groupedPlants = plants.reduce((acc: { [key: number]: Plant[] }, plant) => {
        const categoryId = plant.plant_category_id;
        if (!acc[categoryId]) {
            acc[categoryId] = [];
        }
        acc[categoryId].push(plant);
        return acc;
    }, {});

    return (
        <div className="flex-1 h-fit p-10 box-border">
            <PlantDrawer isDrawerOpen={isDrawerOpen} plantData={plantData} closeDrawer={closeDrawer} />

            <div className="">
                {Object.entries(groupedPlants).map(([categoryId, plantsInCategory]) => (
                    <div key={categoryId}>
                        {/* Category Title */}
                        <h2 className="text-md mb-6 text-gray-600">Category {categoryId}</h2>

                        {/* Cards Grid */}
                        <div className="grid grid-cols-4">
                            {plantsInCategory.map((plant) => (
                                <Card key={plant.plant_id} className="mb-4 w-[350px] hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openDrawer(plant)}>
                                    <CardHeader>
                                        <CardTitle className="text-xl text-gray-700">{plant.plant_name}</CardTitle>
                                        <CardDescription>{plant.description_short}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                                            <img src={plant.images_links[0]} alt={plant.plant_name} className="w-full h-full object-cover" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Separator */}
                        <Separator className="my-8" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default GuidesMain;
