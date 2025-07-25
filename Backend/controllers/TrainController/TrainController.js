const { response } = require("express");
const TrainModel = require("../../models/TrainModel");

module.exports.TrainBetween = async (request, response) => {
  const { from, to } = request.query;
  console.log("Request Receive In Train B/W ");
  console.log("From:", from, "| To:", to);
  if (!from || !to) {
    return response.status(406).json({ message: "Please Provide Parameters" });
  }

  const trains = await TrainModel.find({
    route: { $all: [from, to] },
  });
  if (trains) {
    const validTrains = trains.filter((train) => {
      const fromIndex = train.route.indexOf(from);
      const toIndex = train.route.indexOf(to);
      return fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex;
    });
    // console.log("valid Trains:");
    // console.log(validTrains);
    response.status(200).json(validTrains);
  } else {
    return response.status(208).json({ message: "No Train Found" });
  }
};
