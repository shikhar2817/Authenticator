import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

export const sendDiscordNotification = async (content: string) => {
  await axios.post(process.env.DISCORD_WEBHOOK_URL as string, { content });
};
