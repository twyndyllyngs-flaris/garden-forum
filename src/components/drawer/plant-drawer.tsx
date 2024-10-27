

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

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };
     
    return (
        <div className="">
            <Sheet open={isDrawerOpen}>
                <SheetContent side={"bottom"} className="w-screen h-screen overflow-scroll pt-0">
                    {/* header */}
                    <div className=" h-[70px] flex justify-center items-center sticky top-0 bg-white border-b border-gray-300 z-50">
                        <Button variant="outline" className="self-center" onClick={closeDrawer}>Close</Button>
                        <div className="flex-1 text-center font-bold text-2xl text-gray-700">
                            {plantData?.title}
                        </div>
                    </div>
                    
                    {/* main */}
                    <div className="w-[75%] max-w-[75%] m-auto mt-[50px]">
                        <div className="w-full flex justify-between items-center gap-28">
                            <div className="w-[60%] text-md text-center leading-[2.5rem] text-gray-600">
                                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ipsam eveniet minus, architecto exercitationem voluptatem ea maiores qui deserunt, nobis sunt dolor dicta et laboriosam minima quo reiciendis rerum quos nihil dolorum! Illo perferendis enim dignissimos accusantium! Vitae obcaecati ex, deleniti sequi minus distinctio esse odio impedit ad placeat nihil exercitationem voluptatum eius veniam autem iste atque, ipsa hic, dolor recusandae sed quis consequatur? Ipsum dolore dicta ducimus odio nisi, sapiente porro, nemo corrupti enim aspernatur eius impedit tenetur minima repellendus vel fuga commodi laboriosam consequatur eligendi iure. Amet numquam ab voluptatem quidem reprehenderit laborum qui enim sequi maiores, et cum?
                            </div>
                            <div className="w-[40%] h-[500px] bg-gray-200">
                                {/* Image placeholder */}
                            </div>
                        </div>
                    </div>

                    <div className="w-[75%] max-w-[75%] m-auto mt-[100px]">
                        <div className="text-2xl text-gray-600 font-semibold px-0 mb-[25px]"> Other images </div> 
                        <Carousel
                            opts={{
                                align: "start",
                            }}
                            className="w-full"
                            >
                            <CarouselContent className="">
                                {Array.from({ length: 5 }).map((_, index) => (
                                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/4">
                                    <div className="p-1">
                                    {/* Placeholder image */}
                                    <img
                                        src={`https://placehold.co/400`}
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

                    <div className="w-[75%] m-auto mt-[100px]">
                        <div className="text-2xl text-gray-600 font-semibold px-0 mb-[25px]"> Frequently Asked Questions </div> 
                        <Accordion type="single" collapsible className="text-gray-700">
                            <AccordionItem value="item-1">
                                <AccordionTrigger>Is it accessible?</AccordionTrigger>
                                <AccordionContent>
                                Yes. It adheres to the WAI-ARIA design pattern.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
                                <AccordionTrigger>Is it styled?</AccordionTrigger>
                                <AccordionContent>
                                Yes. It comes with default styles that matches the other
                                components&apos; aesthetic.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3">
                                <AccordionTrigger>Is it animated?</AccordionTrigger>
                                <AccordionContent>
                                Yes. It&apos;s animated by default, but you can disable it if you
                                prefer.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                    
                    <div className="w-[75%] m-auto mt-[100px]">
                        <div className="text-2xl text-gray-600 font-semibold px-0 mb-[25px]"> Steps to follow </div> 
                        <Box sx={{ maxWidth: 1200 }}>
                            <Stepper
                                activeStep={activeStep}
                                orientation="vertical"
                                sx={{
                                    "& .MuiStepIcon-root": {
                                        width: 32,
                                        height: 32,
                                        color: "gray.200", // Gray background for inactive step circles
                                        "&.Mui-active": {
                                            color: "primary.main", // Default MUI primary color for active steps
                                        },
                                    },
                                }}
                            >
                                {steps.map((step, index) => (
                                    <Step 
                                        key={step.label}
                                        sx={{
                                            '& .MuiStepLabel-root .Mui-completed': {
                                              color: 'rgb(75 85 99)', // circle color (COMPLETED)
                                            },
                                            '& .MuiStepLabel-label.Mui-completed.MuiStepLabel-alternativeLabel':
                                              {
                                                color: 'grey.500', // Just text label (COMPLETED)
                                              },
                                            '& .MuiStepLabel-root .Mui-active': {
                                              color: 'rgb(75 85 99)', // circle color (ACTIVE)
                                            },
                                            '& .MuiStepLabel-label.Mui-active.MuiStepLabel-alternativeLabel':
                                              {
                                                color: 'white', // Just text label (ACTIVE)
                                              },
                                            '& .MuiStepLabel-root .Mui-active .MuiStepIcon-text': {
                                              fill: 'white', // circle's number (ACTIVE)
                                            },
                                          }}
                                    >
                                        <StepLabel
                                            optional={
                                                index === steps.length - 1 ? (
                                                    <Typography variant="caption" sx={{ fontSize: "1rem", color: "rgb(55,65,81)" }}>
                                                        Last step
                                                    </Typography>
                                                ) : null
                                            }
                                            sx={{
                                                "& .MuiStepLabel-label": { fontSize: "1.25rem", color: "rgb(55,65,81)" }, // Title as text-xl, gray-700 color
                                            }}
                                        >
                                            {step.label}
                                        </StepLabel>
                                        <StepContent>
                                            <Typography sx={{ fontSize: "1rem", color: "rgb(55,65,81)" }}> {/* Description as text-lg */}
                                                {step.description}
                                            </Typography>
                                            <Box sx={{ mb: 2 }}>
                                                <Button
                                                    className="bg-gray-700 mt-3 mr-3"
                                                    onClick={handleNext}
                                                >
                                                    {index === steps.length - 1 ? 'Finish' : 'Continue'}
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
                            {activeStep === steps.length && (
                                <Button onClick={handleReset} variant="outline">
                                    Reset
                                </Button>
                            )}
                        </Box>

                    </div>
                </SheetContent>
            </Sheet>

        </div>
    );
}

export default PlantDrawer;
