export interface User {
  user_id: string;
  username: string;
  email: string;
  password: string;
}

export interface UserResponse {
  user_id: string;
  email: string;
  username: string;
  message: string;
  authToken: string;
}
