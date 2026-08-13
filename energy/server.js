
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const coap = require("coap");

const Energy = require("./models/energy.js");

app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/energydb")
  .then(() => console.log("mongodb connected successfully"))
  .catch((err) => console.log(err));

const coapServer = coap.createServer();

coapServer.on("request", async (req, res) => {
  console.log("👉 REQUEST RECEIVED");
  console.log("URL:", req.url);

  if (req.method === "POST" && req.url === "/energy") {
    try {
      const data = JSON.parse(req.payload.toString());

      const { deviceId, voltage, current } = data;
      const power = voltage * current;

      const energy = new Energy({
        deviceId,
        voltage,
        current,
        power
      });

      await energy.save();

      console.log("Saved:", energy);

      res.end("data stored successfully");

    } catch (error) {
      console.log(error);
      res.end("error");
    }
  } else {
    res.end("invalid route");
  }
});

coapServer.listen(5683, () => {
  console.log("CoAP server running on port 5683");
});

app.get("/api/energy", async (req, res) => {
  const data = await Energy.find();
  res.json(data);
});
app.put("/api/energy/:deviceId", async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { voltage, current } = req.body;

    // find existing record
    const energy = await Energy.findOne({ deviceId });

    if (!energy) {
      return res.status(404).json({ message: "Device not found" });
    }

    // update values
    if (voltage) energy.voltage = voltage;
    if (current) energy.current = current;

    // recalculate power
    energy.power = energy.voltage * energy.current;

    await energy.save();

    res.json({
      message: "Energy data updated successfully",
      data: energy
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error updating data" });
  }
});
//delete
app.delete("/api/energy/:deviceId",async(req,res)=>
{
try 
{
const result=await Energy.findOneAndDelete({deviceId:req.params.deviceId});
if(!result)
return res.status(400).json({message:"no id found"})

res.json(
{
message:"user successfully deleted"
})
}
catch(err){
console.log(err)
return res.status(400).json({message:"error in deleting"})
}
});

app.listen(3000, () => {
  console.log("server is running on 3000");
});
