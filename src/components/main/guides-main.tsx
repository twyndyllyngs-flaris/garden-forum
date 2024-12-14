import { useState, useEffect } from "react";
import { supabase } from "../../config/supabase/supabaseClient";
import { useNavigate, useLocation, useParams } from "react-router-dom";
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
    sortBy: "name" | "category";
    isAscending: boolean; // Prop for sort order
}

function GuidesMain({ searchTerm, sortBy, isAscending }: GuidesMainProps) {
    const { category, plant } = useParams(); // Get category and plant from URL
    const navigate = useNavigate();
    const location = useLocation();

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

    // Open the drawer and update the URL when a plant card is clicked
    const openDrawer = (plant: Plant): void => {
        setIsDrawerOpen(true);
        setPlantData(plant);
        window.history.pushState({}, "", `/guides/${plant.plant_category_id}/${plant.plant_name}`);
    };

    // Close the drawer and reset the URL back to "/guides"
    const closeDrawer = (): void => {
        setIsDrawerOpen(false);
        navigate("/guides");
    };

    // Open the drawer if URL parameters match a plant
    useEffect(() => {
        if (category && plant && plants.length > 0) {
            const matchingPlant = plants.find(
                (p) => p.plant_category_id === parseInt(category) && p.plant_name === plant
            );
            if (matchingPlant) {
                setPlantData(matchingPlant);
                setIsDrawerOpen(true);
            } else {
                navigate("/guides");
            }
        }
    }, [category, plant, plants]);

    // Filter and sort plants based on searchTerm, sortBy, and isAscending
    const filteredPlants = plants
        .filter((plant) =>
            plant.plant_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === "name") {
                return isAscending
                    ? a.plant_name.localeCompare(b.plant_name)
                    : b.plant_name.localeCompare(a.plant_name);
            } else if (sortBy === "category") {
                return isAscending
                    ? a.plant_category_id - b.plant_category_id
                    : b.plant_category_id - a.plant_category_id;
            }
            return 0;
        });

    // Group plants by category
    const groupedPlants = filteredPlants.reduce((acc: { [key: number]: Plant[] }, plant) => {
        const categoryId = plant.plant_category_id;
        if (!acc[categoryId]) {
            acc[categoryId] = [];
        }
        acc[categoryId].push(plant);
        return acc;
    }, {});

    // Sort categories for rendering
    const sortedCategoryIds = Object.keys(groupedPlants)
        .map(Number) // Convert keys to numbers
        .sort((a, b) => {
            // If sorting by name, always sort categories in ascending order
            if (sortBy === "name") {
                return a - b; // Ascending order
            }
            return isAscending ? a - b : b - a; // For category sorting
        });

    const test = () => {
        console.log(groupedPlants)
    }

    return (
        <div className="flex-1 h-fit p-10 box-border">
            <PlantDrawer isDrawerOpen={isDrawerOpen} plantData={plantData} closeDrawer={closeDrawer} />
            {sortedCategoryIds.map((categoryId) => (
                <div key={categoryId}>
                    <h2 className="text-md mb-6 text-gray-600" onClick={test}>Category {categoryId}</h2>
                    <div className="grid gap-4 grid-cols-[repeat(auto-fit,_350px)] justify-evenly">
                        {groupedPlants[categoryId].map((plant) => (
                            <Card
                                key={plant.plant_id}
                                className="mb-4 hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => openDrawer(plant)}
                            >
                                <CardHeader className="h-[110px]">
                                    <CardTitle className="text-xl text-gray-700">{plant.plant_name}</CardTitle>
                                    <CardDescription>{plant.description_short}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="w-full h-48 max-h-48 bg-gray-200 flex items-center justify-center">
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
