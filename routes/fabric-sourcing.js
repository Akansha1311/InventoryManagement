const express = require("express");
const router = express.Router();
const path = require("path");
const mongoose = require("mongoose");
const shortid = require("shortid");
const moment = require("moment");
//Models
const AvailableProducts = require("../models/AvailableProducts");
const AnalysePerformance = require("../models/AnalysePerformance");
function checkAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    let data = req.flash("message")[0];
    res.render(path.join(__dirname, "../", "/views/login"), {
      message: "",
      data,
    });
  }
}
router.get("/form", checkAuth, (req, res) => {
  res.render(path.join(__dirname, "../", "/views/fabric-sourcing-form.ejs"));
});

router.post("/form", checkAuth, async (req, res) => {
  let newCard = {};
  Object.keys(req.body).forEach(function (prop) {
    newCard[prop] = req.body[prop];
  });
  newCard.id = shortid.generate();
  let availablecard = await AvailableProducts.create(newCard);
  let analyzeCard = await AnalysePerformance.create(newCard);
  res.redirect("/fabric-sourcing/form");
});

router.get("/available-fabrics", async (req, res) => {
  let data = await AvailableProducts.find({}, "-_id -__v")
    .sort({ createdAt: -1 })
    .lean();
  res.render(path.join(__dirname, "../", "/views/availableProducts.ejs"), {
    data,
    moment,
  });
});

router.post("/filter", async (req, res) => {
  let obj = {};
  Object.keys(req.body).forEach(function (prop) {
    if (req.body[prop] && prop != "dateOfReceiving") {
      // obj[prop] = req.body[prop];
      obj[prop] = { $regex: new RegExp(req.body[prop], "i") };
    }
    if (req.body[prop] && prop == "dateOfReceiving") {
      obj[prop] = req.body[prop];
    }
  });
  let data = await AvailableProducts.find(obj, "-_id -__v")
    .sort({ createdAt: -1 })
    .lean();
  res.render(path.join(__dirname, "../", "/views/availableProducts.ejs"), {
    data,
    moment,
  });
});
router.get("/delete/:id", checkAuth, async (req, res) => {
  let id = req.params.id;
  let deletedCard = await AvailableProducts.findOneAndDelete({ id: id });
  res.redirect("/fabric-sourcing/available-fabrics");
});
module.exports = router;
