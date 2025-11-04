if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: "../.env" });
}

const mongoose = require("mongoose");
const Listing = require("../models/listing");
const { data: sampleListings } = require("./data");

const MONGO_URL = process.env.MONGO_URL;
console.log("🔍 MONGO_URL =", MONGO_URL);

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("✅ Connected to MongoDB Atlas!");
}

main()
  .then(async () => {
    await Listing.deleteMany({});
    console.log("🗑️ Old listings removed.");

    // ✅ Ensure geometry exists for all data
    const formattedListings = sampleListings.map((listing) => ({
      ...listing,
      geometry: listing.geometry || {
        type: "Point",
        coordinates: [75.8577, 22.7196], // longitude, latitude of Indore (example)
      },
    }));

    await Listing.insertMany(formattedListings);
    console.log(`🌱 Inserted ${formattedListings.length} listings!`);

    await mongoose.connection.close();
    console.log("🔒 Mongo connection closed. Done!");
  })
  .catch((err) => {
    console.error("❌ Error seeding database:", err);
  });
