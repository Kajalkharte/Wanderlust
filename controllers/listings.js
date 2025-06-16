const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN ;

const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req , res)=>{
   const allListings = await Listing.find({});
   res.render("listings/index.ejs",{allListings});
};

module.exports.rendernewform = (req,res)=>{
   
    res.render("listings/new.ejs");
};

module.exports.showListings = async (req,res)=>{
    let {id} =req.params;
    const listing = await Listing.findById(id).
    populate(
        { path: "reviews",
        populate: {
             path: "author"
            }
        },
    ).populate("owner");
    if(!listing){
        req.flash("error", "Listing you looking for does not exist!");
        return  res.redirect("/listings");
    }
   res.render("listings/show.ejs", {
    listing,
    mapToken: process.env.MAP_TOKEN,
    currUser: req.user // this is optional, if you're using it in show.ejs
});

};

module.exports.createListing = async (req, res, next)=>{
  let response =  await  geocodingClient.forwardGeocode({
  query: req.body.listing.location,
  limit: 1,
})
  .send();
  
       
        let url = req.file.path;
        let filename = req.file.filename;
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id ;
        newListing.image = {url, filename};
        newListing.geometry = response.body.features[0].geometry;
        await newListing.save();
        req.flash("success", "New Listing Created!");
        res.redirect("/listings")
 

};

module.exports.renderEditForm = async (req,res)=>{
    let {id} =req.params;
    const listing = await Listing.findById(id);
     if(!listing){
        req.flash("error", "Listing you looking for does not exist!");
        return  res.redirect("/listings");
    }
    res.render("listings/edit.ejs",{ listing});
};

module.exports.updateListing = async(req,res)=>{

    if(!req.body.listing){
        throw new ExpressError(400, "send a valid data to listing");
    }
    let {id} =req.params;
    let listing = await Listing.findByIdAndUpdate(id , {...req.body.listing});
       if(typeof req.file !=="undefined"){
       let url = req.file.path;
       let filename = req.file.filename;
       listing.image = {url, filename};
       await listing.save();
       }
      req.flash("success", "Listing Updated!");
     res.redirect("/listings");

};

module.exports.destroyListing = async(req,res)=>{
    let {id} =req.params;
     let deletedListing = await Listing.findByIdAndDelete(id);
     console.log(deletedListing);
      req.flash("success", "Listing Deleted!");
     res.redirect("/listings");
};