import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
dotenv.config();

export const jwtGenerator = (user_id: string, forMonth: boolean = false) => {
  const payload = {
    user_id: user_id,
  };

  return jwt.sign(payload, process.env.JWT_SECRET_KEY as string, {
    expiresIn: forMonth ? "30d" : "7d",
  });
};
