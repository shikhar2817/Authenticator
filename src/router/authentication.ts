import express from "express";
import { SignUp } from "../actions/authentication";

export default (router: express.Router) => {
  router.post("/auth/signup", SignUp);
};
