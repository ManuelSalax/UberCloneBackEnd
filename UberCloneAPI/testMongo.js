const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Mongo Connected");
    process.exit(0);
  })
  .catch((err) => {
    console.error("ERROR COMPLETO:");
    console.error(err);
    process.exit(1);
  });