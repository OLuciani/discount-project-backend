import mongoose from "mongoose";

const businessSchema = mongoose.Schema({
    ownerName: String,
    businessName: String,
    businessType: String,
    address: String,
    latitude: Number,
    longitude: Number,
    ownerId: String,
    imageURL: String,
});

const Business = mongoose.model("business", businessSchema);

export default Business;