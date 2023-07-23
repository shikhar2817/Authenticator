import { Request, Response } from "express";
import { pool } from "../db";
import bcrypt from "bcrypt";
import { User } from "../types";
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

    return res.status(200).json({
      id: newUser.user_id,
      email: newUser.email,
      username: newUser.username,
      message: "Registration Successfull",
      authToken: token,
    });
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
        message:
          "Missing Parameters, it can be email, password, firstname or lastname",
      });
    }

    const queryRes = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (queryRes.rowCount === 0) {
      // if user doesn't exist
      return res.status(401).json({
        message: "No user with this email. Kindly Sign up if not done already.",
      });
    }

    const userData: User = queryRes.rows[0];

    // valid password will get true or false value on comparision
    const validPassword = await bcrypt.compare(password, userData.password);

    // if password not matched
    if (!validPassword)
      return res.status(401).json({ message: "Password is incorrect" });

    // generate jwt token
    const token = jwtGenerator(userData.user_id);

    return res.status(200).json({
      id: userData.user_id,
      email: userData.email,
      username: userData.username,
      message: `Welcome ${userData.username}`,
      authToken: token,
    });
  } catch (error) {
    console.error("Logging Error", error);
    return res.status(400).json({
      message:
        "Error Logging the User, If error persist please contact to support@rocketbrains.in",
    });
  }
};
