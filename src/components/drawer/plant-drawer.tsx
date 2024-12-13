

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
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "../ui/carousel"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "../ui/accordion"
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';


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
type MyComponentProps = {
    isDrawerOpen: boolean;
    plantData: Plant | null;
    closeDrawer: () => void
};

const steps = [
    {
        label: 'Select campaign settings',
        description: `For each ad campaign that you create, you can control how much
              you're willing to spend on clicks and conversions, which networks
              and geographical locations you want your ads to show on, and more.`,
    },
    {
        label: 'Create an ad group',
        description:
            'An ad group contains one or more ads which target a shared set of keywords.',
    },
    {
        label: 'Create an ad',
        description: `Try out different ad text to see what brings in the most customers,
              and learn how to enhance your ads using features like ad extensions.
              If you run into any problems with your ads, find out how to tell if
              they're running and how to resolve approval issues.`,
    },
];

function PlantDrawer({ isDrawerOpen, plantData, closeDrawer }: MyComponentProps) {
    const [activeStep, setActiveStep] = useState(0);

    const handleNext = (): void => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = (): void => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = (): void => {
        setActiveStep(0);
    };

    // Using steps from the plantData object
    const stepsArray = Object.entries(plantData?.steps || {}).map(([key, value]) => ({
        label: key,
        description: value,
    }));

    useEffect(() => {
        handleReset();
    }, [isDrawerOpen]);

    return (
        <div className="">
            <Sheet open={isDrawerOpen}>
                <SheetContent side={"bottom"} className="w-screen h-screen overflow-scroll pt-0">
                    {/* header */}
                    <div className=" h-[70px] flex justify-center items-center sticky top-0 bg-white border-b border-gray-300 z-50">
                        <Button variant="outline" className="self-center" onClick={closeDrawer}>Close</Button>
                        <div className="flex-1 text-center font-bold text-2xl text-gray-700">
                            {plantData?.plant_name}
                        </div>
                    </div>

                    {/* main */}
                    <div className="w-[75%] max-w-[75%] m-auto mt-[30px] bg-gray-50 p-10 rounded shadow-sm border ">
                        <div className="w-full flex justify-between items-center gap-28">
                            <div className="w-[60%] text-md text-center leading-[2.5rem] text-gray-600">
                                {plantData?.description_long}
                            </div>
                            <div className=" h-[500px] min-w-[500px] max-w-[500px] bg-gray-200 rounded">
                                <img src={plantData?.images_links[0]} alt={plantData?.plant_name} className="w-full h-full object-cover rounded" />
                            </div>
                        </div>
                    </div>

                    {/* carousel */}
                    <div className="w-[75%] max-w-[75%] m-auto mt-[30px] bg-gray-50 p-14 rounded shadow-sm border ">
                        <div className="text-2xl text-gray-600 font-semibold px-0 mb-[25px]"> Other images </div>
                        <Carousel
                            opts={{
                                align: "start",
                            }}
                            className="w-full"
                        >
                            <CarouselContent className="w-[80%] h-full">
                                {Array.from({ length: 2 }).flatMap(() => // Iterate twice
                                    plantData?.images_links
                                        ?.filter((link) => !link.endsWith('0.jpg')) // Filter out 0.jpg
                                        .slice(0, 4) // Get the first 4 images (1.jpg to 4.jpg)
                                ).map((imageLink, index) => (
                                    <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/4">
                                        <div className="p-1">
                                            <img
                                                src={imageLink}
                                                alt={`Plant image ${index + 1}`} // Provide alt text for accessibility
                                                className="w-full aspect-square object-cover rounded-lg"
                                            />
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious />
                            <CarouselNext />
                        </Carousel>
                    </div>

                    {/* steps */}
                    <div className="w-[75%] m-auto mt-[30px] bg-gray-50 p-10 rounded shadow-sm border">
                        <div className="text-2xl text-gray-600 font-semibold px-0 mb-[25px]"> Steps to follow </div>
                        <Box sx={{ maxWidth: 1200 }}>
                            <Stepper
                                activeStep={activeStep}
                                orientation="vertical"
                                sx={{
                                    "& .MuiStepIcon-root": {
                                        width: 32,
                                        height: 32,
                                        color: "gray.200",
                                        "&.Mui-active": {
                                            color: "primary.main",
                                        },
                                    },
                                }}
                            >
                                {stepsArray.map((step, index) => (
                                    <Step
                                        key={step.label}
                                        sx={{
                                            '& .MuiStepLabel-root .Mui-completed': {
                                                color: 'rgb(75 85 99)',
                                            },
                                            '& .MuiStepLabel-label.Mui-completed.MuiStepLabel-alternativeLabel':
                                            {
                                                color: 'grey.500',
                                            },
                                            '& .MuiStepLabel-root .Mui-active': {
                                                color: 'rgb(75 85 99)',
                                            },
                                            '& .MuiStepLabel-label.Mui-active.MuiStepLabel-alternativeLabel':
                                            {
                                                color: 'white',
                                            },
                                            '& .MuiStepLabel-root .Mui-active .MuiStepIcon-text': {
                                                fill: 'white',
                                            },
                                        }}
                                    >
                                        <StepLabel
                                            optional={
                                                index === stepsArray.length - 1 ? (
                                                    <Typography variant="caption" sx={{ fontSize: "1rem", color: "rgb(55,65,81)" }}>
                                                        Last step
                                                    </Typography>
                                                ) : null
                                            }
                                            sx={{
                                                "& .MuiStepLabel-label": { fontSize: "1.25rem", color: "rgb(55,65,81)" },
                                            }}
                                        >
                                            {step.label}
                                        </StepLabel>
                                        <StepContent>
                                            <Typography sx={{ fontSize: "1rem", color: "rgb(55,65,81)" }}>
                                                {step.description}
                                            </Typography>
                                            <Box sx={{ mb: 2 }}>
                                                <Button
                                                    className="bg-gray-700 mt-3 mr-3"
                                                    onClick={handleNext}
                                                >
                                                    {index === stepsArray.length - 1 ? 'Finish' : 'Continue'}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    disabled={index === 0}
                                                    onClick={handleBack}
                                                >
                                                    Back
                                                </Button>
                                            </Box>
                                        </StepContent>
                                    </Step>
                                ))}
                            </Stepper>
                            {activeStep === stepsArray.length && (
                                <Button onClick={handleReset} variant="outline">
                                    Reset
                                </Button>
                            )}
                        </Box>
                    </div>

                    {/* Frequently Asked Questions */}
                    <div className="w-[75%] m-auto mt-[30px] bg-gray-50 p-10 rounded shadow-sm border">
                        <div className="text-2xl text-gray-600 font-semibold px-0 mb-[25px]"> Frequently Asked Questions </div>
                        <Accordion type="single" collapsible className="text-gray-700">
                            {plantData?.faq && Object.entries(plantData.faq).map(([question, answer], index) => (
                                <AccordionItem key={index} value={`item-${index}`}>
                                    <AccordionTrigger className="text-lg">{question}</AccordionTrigger>
                                    <AccordionContent>{answer}</AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </SheetContent>
            </Sheet>

        </div>
    );
}

export default PlantDrawer;
