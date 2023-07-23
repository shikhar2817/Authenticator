import { Request, Response } from "express";
import { pool } from "../db";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { User } from "../types";
import { sendDiscordNotification } from "../utils";

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

    return res.status(200).json({
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      message: "Registration Successfull",
    });
  } catch (error) {
    console.error("Registration Error", error);
    return res.status(400).json({
      message:
        "Error Registering the User, If error persist please contact to support@rocketbrains.in",
    });
  }
};
