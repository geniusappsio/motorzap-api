export interface CreateUserResponse {
  id: string;
  phone: string;
  role: string;
  name: string;
  email?: string;
  createdAt: Date;
}
