import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db";
import { User, UserResponse } from "../types";
import { jwtGenerator, sendDiscordNotification } from "../utils";

export const SignUp = async (req: Request, res: Response) => {
  try {
    const { email, password, username } = req.body;

    // if any of the parameter are empty
    if (!email || !password || !username) {
      console.log("Missing Parameter: ", email, password, username);
      return res.status(400).json({
        message:
          "Missing Parameters, it can be email, password, firstname or lastname",
      });
    }

    const dbRows = await pool.query("select * from users where email = $1", [
      email,
    ]);
    // if user already registered
    if (dbRows.rowCount !== 0) {
      console.log("User already registered");
      return res.status(401).json({
        message: "User is already registered with this email address",
      });
    }

    // registering user into DB
    // hasing password
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const bcryptPassword = await bcrypt.hash(password, salt);

    // adding user info into db
    const newUser: User = (
      await pool.query(
        "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
        [username, email, bcryptPassword]
      )
    ).rows[0];

    console.log("New User Registered", newUser.username, newUser.email);

    sendDiscordNotification(
      `😻 New User Created 😻\n\n ☃️ Name: ${newUser.username} \n ✉️ Email: ${newUser.email}\n🆒🆒🆒🆒🆒🆒🆒🆒🆒🆒🆒🆒🆒`
    );

    // generating jwt token
    const token = jwtGenerator(newUser.user_id);
    const userData: UserResponse = {
      user_id: newUser.user_id,
      email: newUser.email,
      username: newUser.username,
      message: `Registration Successfull, Welcome ${newUser.username}`,
      authToken: token,
    };

    return res.status(200).json(userData);
  } catch (error) {
    console.error("Registration Error", error);
    return res.status(400).json({
      message:
        "Error Registering the User, If error persist please contact to support@rocketbrains.in",
    });
  }
};

export const Login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // if any of the parameter are empty
    if (!email || !password) {
      console.log("Missing Parameter: ", email, password);
      return res.status(400).json({
        message: "Missing Parameters, it can be email, password",
      });
    }

    const queryRes = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (queryRes.rowCount === 0) {
      // if user doesn't exist
      console.log("User not found: ", email);
      return res.status(401).json({
        message: "No user with this email. Kindly Sign up if not done already.",
      });
    }

    const userData: User = queryRes.rows[0];

    // valid password will get true or false value on comparision
    const validPassword = await bcrypt.compare(password, userData.password);

    // if password not matched
    if (!validPassword) {
      console.log("Incorrect password attempt: ", userData.email);
      return res.status(401).json({ message: "Password is incorrect" });
    }

    // generate jwt token
    const jwtToken = jwtGenerator(userData.user_id);

    const userRes: UserResponse = {
      user_id: userData.user_id,
      email: userData.email,
      username: userData.username,
      message: `Welcome ${userData.username}`,
      authToken: jwtToken,
    };

    return res.status(200).json(userRes);
  } catch (error) {
    console.error("Logging Error", error);
    return res.status(400).json({
      message:
        "Error Logging the User, If error persist please contact to support@rocketbrains.in",
    });
  }
};

export const verifyAuthToken = (req: Request, res: Response) => {
  try {
    const jwtToken = req.header("authToken");

    // if token doesn't exist
    if (!jwtToken)
      return res.status(403).json({ message: "User is Unauthorize" });

    jwt.verify(jwtToken, process.env.JWT_SECRET_KEY as string, (error) => {
      if (error) {
        return res
          .status(400)
          .json({ message: "invalid auth token", error: error });
      } else {
        res.status(200).json({ message: "valid token" });
      }
    });

    return res.status(400).json({ message: "invalid auth token" });
  } catch (error) {
    console.log("Auth Token Verification Error", error);
    return res.status(400).json({
      message: "Error while verifying Auth Token",
    });
  }
};
