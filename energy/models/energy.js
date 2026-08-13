const mongoose=require("mongoose");

const energyschema=new mongoose.Schema({
deviceId:String,
voltage:Number,
current:Number,
power:Number

});

module.exports=mongoose.model("Energy",energyschema);
