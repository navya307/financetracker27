export interface User {
  id: string;
  email: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
}

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  created_at: string;
}

export interface Income {
  id: string;
  user_id: string;
  amount: number;
  source: string;
  date: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}