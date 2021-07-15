var express = require("express");
var router = express.Router();
const Joi = require("joi");
const db = require("../data.json");
const ITEMS_PER_PAGE = 10;

router.get("/events", function (req, res, next) {
  // Todo: CORS

  const query = req.query;
  const start = query.start ? new Date(query.start).getTime() : "";

  const end = query.end ? new Date(query.end).getTime() : "";
  const outcome = query.outcome;

  const schema = Joi.object({
    start: Joi.date().allow(null, ""),
    end: Joi.date().allow(null, ""),
    outcome: Joi.boolean().allow(null, "true", "false"),
  });

  const { error } = schema.validate({
    start,
    end,
    outcome,
  });

  if (error) {
    console.log(error);
    res.status(400).json({
      message: "invalid parameters",
      code: "INVALID_DATA",
    });
    return;
  }

  const page = parseInt(query.page) || 1;

  // filter
  let result = [];

  let o = outcome == "true" ? true : false;
  result = outcome ? db.alarms.filter((a) => a.outcome == o) : db.alarms;

  result = result.map((a) => {
    const location = db.locations.find((l) => l.id == a.location);

    return {
      outcome: a.outcome,
      location,
      timestamp: new Date(a.timestamp).getTime(),
    };
  });

  result = start
    ? result.filter((a) => {
        return end
          ? a.timestamp >= start && a.timestamp <= end
          : a.timestamp >= start;
      })
    : result;

  // paginate
  const skip = page == 1 ? 0 : (page - 1) * ITEMS_PER_PAGE;
  const endAt = skip + ITEMS_PER_PAGE;

  const response = result.slice(skip, endAt);

  res.send(response);
});

// router.get("/events:/eventId", (req, res) => {
//   // might not work. Data doesn't have unique identifiers

//   const eventId = req.params.eventId;
//   const result = db.alarms.find((a) => a.id == eventId);
//   res.json(result);
// });

module.exports = router;
