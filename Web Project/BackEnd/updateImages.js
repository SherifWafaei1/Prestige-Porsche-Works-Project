const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const PorscheModel = require('./models/PorscheModel');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

const modelImages = {
    "911": "Porsche911.png",
    "taycan": "taycan.png",
    "cayenne": "Cayenne.png",
    "macan": "Macan.png",
    "panamera": "Panamera.png",
    "boxster": "Porsche718Boxster.png",
    "carrera_gt": "CarreraGt.png",
    "918_spyder": "newPorsche918Spyder.png",
    "taycan_turbo_s": "TaycanTurboS.png",
    "911_gt3": "Porsche911GT3.png",
    "gt2_rs": "Porsche911GT2RS.png",
    "911_turbo_s": "Porsche911TurboS.png",
    "taycan_cross": "TaycanCross.webp",
    "spyder_rs": "Spyder718.png",
    "classic_356": "Classic356.png"
};

async function updateModelImages() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            family: 4
        });
        console.log('Connected to MongoDB for image update.');

        const models = await PorscheModel.find({});

        for (const model of models) {
            // Normalize model name for lookup in modelImages
            let normalizedName = model.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (normalizedName.includes('porsche')) {
                normalizedName = normalizedName.replace('porsche', '');
            }
            // Special handling for specific models if their names don't directly match keys
            if (normalizedName.includes('718boxster')) {
                normalizedName = 'boxster';
            } else if (normalizedName.includes('turbos') && normalizedName.includes('taycan')) {
                normalizedName = 'taycan_turbo_s';
            } else if (normalizedName.includes('gt3')) {
                normalizedName = '911_gt3';
            } else if (normalizedName.includes('gt2rs')) {
                normalizedName = 'gt2_rs';
            } else if (normalizedName.includes('turbos') && normalizedName.includes('911')) {
                normalizedName = '911_turbo_s';
            } else if (normalizedName.includes('crossturismo') && normalizedName.includes('taycan')) {
                normalizedName = 'taycan_cross';
            } else if (normalizedName.includes('spyderrs') && normalizedName.includes('718')) {
                normalizedName = 'spyder_rs';
            } else if (normalizedName.includes('classic356')) {
                normalizedName = 'classic_356';
            } else if (normalizedName.includes('carreragt')) {
                normalizedName = 'carrera_gt';
            } else if (normalizedName.includes('918spyder')) {
                normalizedName = '918_spyder';
            }


            if (modelImages[normalizedName]) {
                const oldImageUrl = modelImages[normalizedName];
                if (model.imageUrl !== oldImageUrl) {
                    await PorscheModel.findByIdAndUpdate(model._id, { imageUrl: oldImageUrl });
                    console.log(`Updated ${model.name} image to: ${oldImageUrl}`);
                } else {
                    console.log(`${model.name} image is already up to date.`);
                }
            } else {
                console.log(`No old image found for ${model.name} (normalized: ${normalizedName}).`);
            }
        }

        console.log('Image update process complete.');
    } catch (error) {
        console.error('Error updating model images:', error);
    } finally {
        mongoose.disconnect();
    }
}

updateModelImages(); 