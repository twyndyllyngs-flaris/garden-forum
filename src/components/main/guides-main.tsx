import { useState, useEffect } from "react";
import { supabase } from "../../config/supabase/supabaseClient";
import '../../styling/output.css';
import "non.geist"

// Components
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../ui/card";
import { Separator } from "../ui/seperator";
import PlantDrawer from "../drawer/plant-drawer";

interface Plant {
    plant_id: string;
    plant_category_id: number;
    plant_name: string;
    description_short: string;
    description_long: string;
    steps: { [key: string]: string };
    faq: { [key: string]: string };
    images_links: string[];
}

interface GuidesMainProps {
    searchTerm: string;
}

function GuidesMain({ searchTerm }: GuidesMainProps) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [plants, setPlants] = useState<Plant[]>([]);
    const [plantData, setPlantData] = useState<Plant | null>(null);

    const fetchPlants = async () => {
        const { data, error } = await supabase.from("plants").select("*");
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

    const filteredPlants = plants.filter((plant) =>
        plant.plant_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const groupedPlants = filteredPlants.reduce((acc: { [key: number]: Plant[] }, plant) => {
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

            {Object.entries(groupedPlants).map(([categoryId, plantsInCategory]) => (
                <div key={categoryId}>
                    <h2 className="text-md mb-6 text-gray-600">Category {categoryId}</h2>
                    <div className="grid grid-cols-4 gap-4">
                        {plantsInCategory.map((plant) => (
                            <Card
                                key={plant.plant_id}
                                className="mb-4 w-[350px] hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => openDrawer(plant)}
                            >
                                <CardHeader>
                                    <CardTitle className="text-xl text-gray-700">{plant.plant_name}</CardTitle>
                                    <CardDescription>{plant.description_short}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                                        <img
                                            src={plant.images_links[0]}
                                            alt={plant.plant_name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    <Separator className="my-8" />
                </div>
            ))}
        </div>
    );
}

export default GuidesMain;
