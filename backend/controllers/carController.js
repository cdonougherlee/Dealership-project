const mongoose = require("mongoose");
const Car = mongoose.model("Car");
const asyncHandler = require("express-async-handler");

const createCar = asyncHandler(async (req, res) => {
  const { user, username } = extractCommonVariables(req);
  if (!URLAuthenticated(user, username, res)) {
    return;
  }

  // Create car
  const { brand, model, colour, trim, options } = req.body;
  const car = await Car.create({
    brand: brand,
    model: model,
    colour: colour,
    trim: trim,
    options: options,
    owner: user.id,
  });

  // If car successfully created, push to user's (owner) car array
  if (car) {
    user.cars.push(car);
    user.save();
    console.log("create", user.cars);
    res.status(200).json({ success: true, msg: car });
  } else {
    // Else return invalid data error
    res.status(400).json({ success: false, msg: "Invalid user data" });
  }
});

const viewCar = asyncHandler(async (req, res) => {
  const { user, car_id, username } = extractCommonVariables(req);
  if (!URLAuthenticated(user, username, res)) {
    return;
  }

  // Get requested car from user's cars array[index]
  const car = await Car.findOne({ _id: car_id });

  if (car) {
    console.log("view", user.cars);

    res.status(200).json({ success: true, car: car });
  } else {
    res.json({ success: false, msg: "Car not found" });
  }
});

const updateCar = asyncHandler(async (req, res) => {
  const { user, car_id, username } = extractCommonVariables(req);
  if (!URLAuthenticated(user, username, res)) {
    return;
  }

  // Update requested car from user's cars array[index]
  const updatedCar = await Car.findByIdAndUpdate(car_id, req.body, {
    new: true, // "Returns the document after update was applied"
  });

  if (updatedCar) {
    console.log("update", user.cars);

    res.status(200).json({ success: true, car: updatedCar });
  } else {
    res
      .status(400)
      .json({ success: false, msg: "Car not found or invalid data" });
  }
});

const deleteCar = asyncHandler(async (req, res) => {
  const { user, car_id, username } = extractCommonVariables(req);
  if (!URLAuthenticated(user, username, res)) {
    return;
  }

  // Find delete car from the db and user's car array
  const deletedCar = await Car.deleteOne({ _id: car_id });
  if (deletedCar.deletedCount === 1) {
    // Keep user's car array up to date too
    const i = user.cars.indexOf(car_id);
    user.cars.splice(i, 1);
    user.save();

    res.status(200).json({ success: true, car: deletedCar });
  } else {
    res.status(400).json({ success: false, msg: "Car not found" });
  }
});

// Helper functions
const extractCommonVariables = (req) => {
  const user = req.user;
  const { index, username } = req.params;
  const car_id = user.cars.at(index);
  return { user, car_id, username };
};

const URLAuthenticated = (user, username, res) => {
  // Make sure logged in user matches the URI username parameter
  if (user.username !== username) {
    res.status(401).json({ success: false, msg: "Unauthorized" });
    return false;
  }
  return true;
};

module.exports = {
  createCar,
  viewCar,
  updateCar,
  deleteCar,
};
