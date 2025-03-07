export interface UserSession {
    userId: number;
    id: number;
    title: string;
    completed: boolean;
    email: string;
    documentNumber: string;
  }

  export type LoginResponse = UserSession | { error: string };
