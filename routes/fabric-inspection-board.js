const express = require("express");
const router = express.Router();
const path = require("path");
const KanbanCard = require("../models/KanbanCard");
const FabricInspectionBoardInProgress = require("../models/FabricInspectionBoardInProgress");
const FabricInspectionBoardCompleted = require("../models/FabricInspectionBoardCompleted");
const cuttingBoardTodo = require("../models/cuttingBoardTodo");
let PerformanceAnalyze = require("../models/AnalysePerformance");
let NotificationBoard = require("../models/NotificationBoard");

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

//Method = GET
//Route = /fabric-inspection-board
router.get("/", async (req, res) => {
  let Kanbandata = await KanbanCard.find({}, "-_id -__v").lean().limit(5);
  let inProgressData = await FabricInspectionBoardInProgress.find(
    {},
    "-_id -__v"
  ).lean();
  let completedData = await FabricInspectionBoardCompleted.find({}, "-_id -__v")
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();
  res.render(path.join(__dirname, "../", "/views/fabric-inspection-board"), {
    data: Kanbandata,
    inProgress: inProgressData,
    completed: completedData,
  });
});

router.get("/:id", checkAuth, async (req, res) => {
  let id = req.params.id;
  let deletedCard = await KanbanCard.findOneAndDelete({ id: id }).lean();
  let newInProgressCard = {};
  Object.keys(deletedCard).forEach(function (prop) {
    if (prop != "_id" || prop != "__v")
      newInProgressCard[prop] = deletedCard[prop];
  });
  let inProgressCard = await FabricInspectionBoardInProgress.create(
    newInProgressCard
  );
  res.redirect("/fabric-inspection-board");
});

router.get("/completed/:id", checkAuth, async (req, res) => {
  let id = req.params.id;
  let deletedCard = await FabricInspectionBoardInProgress.findOneAndDelete({
    id: id,
  }).lean();
  let newCompletedCard = {};
  Object.keys(deletedCard).forEach(function (prop) {
    if (prop != "_id" || prop != "__v")
      newCompletedCard[prop] = deletedCard[prop];
  });
  let completedCard = await FabricInspectionBoardCompleted.create(
    newCompletedCard
  );
  let cuttingCard = await cuttingBoardTodo.create(newCompletedCard);
  newCompletedCard.dept = "fabric";
  delete newCompletedCard._id;
  let performance = await PerformanceAnalyze.create(newCompletedCard);
  let notificationData = {
    dept: "One task completed by Fabric Inspection Department",
  };
  let notifiction = await NotificationBoard.create(notificationData);

  res.redirect("/fabric-inspection-board");
});

module.exports = router;
