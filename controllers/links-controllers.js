const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const Link = require("../models/link");
const User = require("../models/user");

const getLinksByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let userWithLinks;
  try {
    userWithLinks = await Link.findById(userId).populate("links");
  } catch (err) {
    const error = new HttpError(
      "Fetching links failed, please try again later.",
      500
    );
    return next(error);
  }

  if (!userWithLinks || userWithLinks.links.length === 0) {
    const error = new HttpError(
      "Could not find links for the provided user Id.",
      404
    );
    return next(error);
  }

  res.json({
    links: userWithLinks.links.map((link) => link.toObject({ getters: true })),
  });
};

const createLink = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError(
      "Invalid inputs passed, please check data.",
      422
    );
    return next(error);
  }

  const { title, description, originalUrl, category } = req.body;

  const createdLink = new Link({
    title,
    description,
    originalUrl,
    category,
    shortUrl: "FIX IT LATER",
    creator: req.userData.userId,
  });

  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError("Creating link failed, please try again.", 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Could not find user for provided id.", 404);
    return next(error);
  }

  console.log(user);

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdLink.save({ session: sess });
    user.links.push(createdLink);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Creating link failed, please try again.", 500);
    return next(error);
  }

  res.status(201).json({ link: createdLink });
};

const updateLink = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const linkId = req.params.lid;
  const { title, description } = req.body;

  let link;
  try {
    link = await Link.findById(linkId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update link info.",
      500
    );
    return next(error);
  }

  if (link.creator.toString() !== req.userData.userId) {
    const error = new HttpError("You are not allowed to edit this link.", 401);
    return next(error);
  }

  link.title = title;
  link.description = description;

  try {
    await link.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update link.",
      500
    );
    return next(error);
  }

  res.status(200).json({ link: link.toObject({ getters: true }) });
};

const deleteLink = async (req, res, next) => {
  const linkId = req.params.lid;

  let link;
  try {
    link = await Link.findById(linkId).populate("creator");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete link.",
      500
    );
    return next(error);
  }

  if (!link) {
    const error = new HttpError("Could not find link for this id.", 404);
    return next(error);
  }

  if (link.creator.id !== req.userData.userId) {
    const error = new HttpError(
      "You are not allowed to delete this link.",
      401
    );
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await link.remove({ session: sess });
    link.creator.links.pull(link);
    await link.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete link.",
      500
    );
    return next(error);
  }

  res.status(200).json({ message: "Deleted link." });
};

exports.getLinksByUserId = getLinksByUserId;
exports.createLink = createLink;
exports.updateLink = updateLink;
exports.deleteLink = deleteLink;
