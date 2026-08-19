export interface AuthUser {
  id: number;
  name: string;
  email: string;
  mobileNumber?: string | null;
  address?: string | null;
  roleName: string | null;
}

export interface AuthSession {
  accessToken: string;
  expiresAt?: string | null;
  user: AuthUser;
  permissions: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  mobileNumber?: string;
  address?: string;
}

export interface UpdateProfileData {
  name?: string;
  mobileNumber?: string;
  address?: string;
  password?: string;
}

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<AuthSession>;
  register(data: RegisterData): Promise<AuthSession>;
  me(): Promise<AuthSession>;
  updateProfile(data: UpdateProfileData): Promise<AuthSession>;
  logout(): Promise<void>;
}