import mongoose from "mongoose";

const businessSchema = mongoose.Schema({
    ownerName: String,
    businessName: String,
    address: String,
    ownerId: String,
});

const Business = mongoose.model("business", businessSchema);

export default Business;