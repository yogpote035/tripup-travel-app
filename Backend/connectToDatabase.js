const mongoose = require("mongoose");
const ensureBootstrapAdmin = require("./utils/bootstrapAdmin");

const connectToDatabase = async () => {
  await mongoose
    .connect(process.env.MONGO_URI)
    .then(async () => {
      console.log("Connected To Database");
      await ensureBootstrapAdmin();
    })
    .catch((err) => console.log("Not Connected To Database " + err));
};

module.exports = connectToDatabase;
