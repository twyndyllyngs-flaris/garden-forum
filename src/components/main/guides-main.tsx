import { useEffect } from "react"; // Import useState
import { supabase } from "../../config/supabase/supabaseClient"; // Adjust the import path as needed
import '../../styling/output.css';

//components
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "../ui/card"


// objects
interface Item {
    title: string;
    description: string;
}
  
interface Category {
    [categoryName: string]: Item[];
}
  
const categories: Category = {
    "Category 1": [
      {
        title: "Item 1",
        description: "This is the first item in Category 1."
      },
      {
        title: "Item 2",
        description: "This is the second item in Category 1."
      }
    ],
    "Category 2": [
      {
        title: "Item A",
        description: "This is the first item in Category 2."
      },
      {
        title: "Item B",
        description: "This is the second item in Category 2."
      }
    ],
    "Category 3": [
      {
        title: "Item A",
        description: "This is the first item in Category 2."
      },
      {
        title: "Item B",
        description: "This is the second item in Category 2."
      }
    ]
};

function GuidesMain() {
    return (
      <div className="w-full h-full max-h-full max-w-full overflow-scroll bg-red-200">
        <div className="space-y-12">
          {Object.entries(categories).map(([categoryName, items]) => (
            <div key={categoryName}>
              {/* Category Title */}
              <h2 className="text-2xl font-bold mb-6">{categoryName}</h2>
  
              {/* Cards Grid */}
              <div className="grid grid-cols-3 gap-6">
                {items.map((item, index) => (
                  <Card key={index} className="w-[400px]">
                    <CardHeader>
                      <CardTitle>{item.title}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="w-full h-48 bg-gray-300 flex items-center justify-center">
                        <img
                          src="https://via.placeholder.com/150"
                          alt={item.title}
                          className="object-cover"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
}
  
export default GuidesMain;
