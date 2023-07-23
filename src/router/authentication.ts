import express from "express";
import { Login, SignUp } from "../actions/authentication";

export default (router: express.Router) => {
  router.post("/auth/signup", SignUp);
  router.post("/auth/login", Login);
};
