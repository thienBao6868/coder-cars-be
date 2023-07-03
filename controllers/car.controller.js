const mongoose = require("mongoose");
const Car = require("../models/Car");
const { sendResponse, AppError } = require("../helpers/utils.js");

const carController = {};

carController.createCar = async (req, res, next) => {
  try {
    // input validation
    let { make, model, release_date, transmission_type, size, style, price } =
      req.body;
    // handle  error
    if (
      !make ||
      !model ||
      !release_date ||
      !transmission_type ||
      !size ||
      !style ||
      !price
    ) {
      throw new AppError(402, "Bad Request", "Missing require data");
    }
    let carNew = await Car.create({
      make: make,
      model: model,
      release_date: release_date,
      transmission_type: transmission_type,
      size: size,
      style: style,
      price: price,
    });
    sendResponse(res, 200, true, { carNew }, null, "create car successfully!");
  } catch (err) {
    next(err);
  }
};

carController.getCars = async (req, res, next) => {
  //input validation
  const allowedFilter = ["page", "limit"];
  try {
    let { page, limit, ...filterQuery } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    //allow title,limit and page query string only
    const filterKeys = Object.keys(filterQuery);

    filterKeys.forEach((key) => {
      if (!allowedFilter.includes(key)) {
        throw new AppError(402, "Bad Request", "Found list of Cars error");
      }
      if (!filterQuery[key]) delete filterQuery[key];
    });
    //processing logic
    //Number of items skip for selection
    let offset = limit * (page - 1);
    //mongoose query
    let allCars = await Car.find();
    allCars = allCars.filter((item) => item.isDeleted === false);
    const totalPages = parseInt(allCars.length / limit);
    //then select number of result by offset
    allCars = allCars.slice(offset, offset + limit);
    sendResponse(
      res,
      200,
      true,
      { cars: allCars, page, total: totalPages },
      null,
      "Found list of cars success"
    );
  } catch (err) {
    next(err);
  }
};

carController.editCar = async (req, res, next) => {
  try {
    let { id } = req.params;
    let updates = req.body;
    let updatedCar = await Car.findByIdAndUpdate(
      id,
      { ...updates },
      { new: true }
    ); //returns the document
    console.log(updatedCar, "test");
    sendResponse(
      res,
      200,
      true,
      { car: updatedCar },
      null,
      "Update Car Successfully!"
    );
  } catch (err) {
    next(err);
  }
};

carController.deleteCar = async (req, res, next) => {
  const { id } = req.params;
  try {
    let carIsDeleted = await Car.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    sendResponse(res, 200, true, {}, null, "Delete Car Successfully!");
  } catch (err) {
    next(err);
  }
};

module.exports = carController;
