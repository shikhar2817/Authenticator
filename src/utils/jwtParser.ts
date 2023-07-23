export const getUserIdFromJWT = (token: string) => {
  const payload = JSON.parse(
    Buffer.from(token.split(".")[1], "base64").toString()
  );
  console.log("getUserId :", payload, token);
  return payload.user_id;
};
