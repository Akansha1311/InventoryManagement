const express = require("express");
const router = express.Router();
const path = require("path");
const mongoose = require("mongoose");
const shortid = require("shortid");
const moment = require("moment");
//Models
const KanbanCard = require("../models/KanbanCard");
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
router.get("/", (req, res) => {
  res.render(path.join(__dirname, "../", "/views/fabric-issuing-card.ejs"));
});

router.post("/", async (req, res) => {
  let newCard = {};
  Object.keys(req.body).forEach(function (prop) {
    newCard[prop] = req.body[prop];
  });
  newCard.id = shortid.generate();
  let card = await KanbanCard.create(newCard);
  res.redirect("/fabric-issuing-card");
});

module.exports = router;
