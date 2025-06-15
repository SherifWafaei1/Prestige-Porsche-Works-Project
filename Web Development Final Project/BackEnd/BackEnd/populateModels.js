const mongoose = require('mongoose');
const PorscheModel = require('./models/PorscheModel'); // Assuming you have a PorscheModel model
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

const models = [
    {
        name: "Porsche 911",
        year: 2024,
        price: 100000,
        imageUrl: "origImg1.png",
        description: "The iconic sports car, reimagined for the future.",
        features: ["Sport Chrono Package", "Bose Surround Sound System"],
        specifications: {
            engine: "3.0L Twin-Turbo Flat-6",
            horsepower: 379,
            "0-60mph": "3.5 s",
            topSpeed: "182 mph"
        }
    },
    {
        name: "Porsche Taycan",
        year: 2024,
        price: 85000,
        imageUrl: "origImg2.png",
        description: "The electric sports car, combining performance with sustainability.",
        features: ["Porsche E-Performance", "Adaptive Air Suspension"],
        specifications: {
            engine: "Electric Motors",
            horsepower: 402,
            "0-60mph": "3.8 s",
            topSpeed: "143 mph"
        }
    },
    {
        name: "Porsche Cayenne",
        year: 2024,
        price: 75000,
        imageUrl: "img4.png",
        description: "The SUV with true Porsche sports car DNA.",
        features: ["Panoramic Roof System", "Off-road Package"],
        specifications: {
            engine: "3.0L V6 Turbo",
            horsepower: 335,
            "0-60mph": "5.9 s",
            topSpeed: "152 mph"
        }
    },
    {
        name: "Porsche Macan",
        year: 2024,
        price: 65000,
        imageUrl: "img5.png",
        description: "The compact SUV that redefines sporty driving.",
        features: ["SportDesign Package", "Burmester High-End Surround Sound System"],
        specifications: {
            engine: "2.0L Turbo Inline-4",
            horsepower: 261,
            "0-60mph": "6.0 s",
            topSpeed: "144 mph"
        }
    },
    {
        name: "Porsche Panamera",
        year: 2024,
        price: 90000,
        imageUrl: "img6.png",
        description: "Luxury and performance, harmoniously combined.",
        features: ["Executive Rear Seats", "Rear-Axle Steering"],
        specifications: {
            engine: "2.9L Twin-Turbo V6",
            horsepower: 325,
            "0-60mph": "5.3 s",
            topSpeed: "168 mph"
        }
    },
    {
        name: "Porsche 718 Boxster",
        year: 2024,
        price: 70000,
        imageUrl: "img7.png",
        description: "The mid-engine roadster with pure driving pleasure.",
        features: ["Sport Seats Plus", "Porsche Active Suspension Management"],
        specifications: {
            engine: "2.0L Turbo Flat-4",
            horsepower: 300,
            "0-60mph": "4.9 s",
            topSpeed: "170 mph"
        }
    },
    {
        name: "Porsche Carrera GT",
        year: 2004,
        price: 440000,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Porsche_Carrera_GT_-_Goodwood_Breakfast_Club_%28July_2008%29.jpg/1200px-Porsche_Carrera_GT_-_Goodwood_Breakfast_Club_%28July_2008%29.jpg",
        description: "A timeless supercar, engineered for the track.",
        features: ["Carbon Fiber Monocoque", "Ceramic Composite Brakes"],
        specifications: {
            engine: "5.7L V10",
            horsepower: 603,
            "0-60mph": "3.5 s",
            topSpeed: "205 mph"
        }
    },
    {
        name: "Porsche 918 Spyder",
        year: 2015,
        price: 845000,
        imageUrl: "img8.png",
        description: "The hybrid hypercar, combining electric power with a V8 engine.",
        features: ["Hybrid Powertrain", "Weissach Package"],
        specifications: {
            engine: "4.6L V8 Hybrid",
            horsepower: 887,
            "0-60mph": "2.2 s",
            topSpeed: "211 mph"
        }
    },
    {
        name: "Porsche Taycan Turbo S",
        year: 2024,
        price: 185000,
        imageUrl: "img9.png",
        description: "The top-tier electric sports car, with unparalleled acceleration.",
        features: ["Overboost Power", "Porsche Ceramic Composite Brakes"],
        specifications: {
            engine: "Electric Motors",
            horsepower: 750,
            "0-60mph": "2.6 s",
            topSpeed: "162 mph"
        }
    },
    {
        name: "Porsche 911 GT3",
        year: 2024,
        price: 175000,
        imageUrl: "img10.png",
        description: "The purist's choice, a track-focused machine.",
        features: ["Rear Wing", "GT Sport Steering Wheel"],
        specifications: {
            engine: "4.0L Naturally Aspirated Flat-6",
            horsepower: 502,
            "0-60mph": "3.2 s",
            topSpeed: "197 mph"
        }
    },
    {
        name: "Porsche 911 GT2 RS",
        year: 2019,
        price: 250000,
        imageUrl: "img11.png",
        description: "The most powerful 911, built for extreme performance.",
        features: ["Lightweight Design", "Clubsport Package"],
        specifications: {
            engine: "3.8L Twin-Turbo Flat-6",
            horsepower: 690,
            "0-60mph": "2.7 s",
            topSpeed: "211 mph"
        }
    },
    {
        name: "Porsche 911 Turbo S",
        year: 2024,
        price: 200000,
        imageUrl: "img12.png",
        description: "The ultimate everyday sports car, blending power with usability.",
        features: ["Adaptive Aerodynamics", "Porsche Dynamic Chassis Control"],
        specifications: {
            engine: "3.8L Twin-Turbo Flat-6",
            horsepower: 640,
            "0-60mph": "2.6 s",
            topSpeed: "205 mph"
        }
    },
    {
        name: "Porsche Taycan Cross Turismo",
        year: 2024,
        price: 95000,
        imageUrl: "img13.png",
        description: "The adventurous electric sports car, ready for any terrain.",
        features: ["Gravel Mode", "Off-Road Design Package"],
        specifications: {
            engine: "Electric Motors",
            horsepower: 375,
            "0-60mph": "4.8 s",
            topSpeed: "136 mph"
        }
    },
    {
        name: "Porsche 718 Spyder RS",
        year: 2024,
        price: 160000,
        imageUrl: "img14.png",
        description: "The ultimate open-top driving experience.",
        features: ["Lightweight Construction", "Sport Exhaust System"],
        specifications: {
            engine: "4.0L Naturally Aspirated Flat-6",
            horsepower: 493,
            "0-60mph": "3.2 s",
            topSpeed: "191 mph"
        }
    },
    {
        name: "Porsche Classic 356",
        year: 1965,
        price: 150000,
        imageUrl: "img15.png",
        description: "A timeless classic, the foundation of Porsche's legacy.",
        features: ["Vintage Design", "Air-cooled Engine"],
        specifications: {
            engine: "1.6L Flat-4",
            horsepower: 60,
            "0-60mph": "13.5 s",
            topSpeed: "99 mph"
        }
    }
];

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    family: 4
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB:', err));

async function populateModels() {
    try {
        console.log('Starting model population...');
        // Clear existing models
        await PorscheModel.deleteMany({});
        console.log('Cleared existing Porsche models.');

        // Insert new models
        for (const modelData of models) {
            const newModel = new PorscheModel(modelData);
            await newModel.save();
            console.log(`Added model: ${newModel.name}`);
        }
        console.log('All Porsche models populated successfully!');
    } catch (error) {
        console.error('Error populating models:', error);
    } finally {
        mongoose.connection.close();
    }
}

populateModels(); 