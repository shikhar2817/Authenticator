import express from "express";
import { Login, SignUp, verifyAuthToken } from "../actions";

export default (router: express.Router) => {
  router.post("/auth/signup", SignUp);
  router.post("/auth/login", Login);
  router.get("/auth/verify", verifyAuthToken);
};
