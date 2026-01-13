import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the User interface to match your Java User Entity/DTO
interface User {
  id: string | number;
  name: string;
  email?: string;
  phone: string;
  avatarUrl?: string;
  roles?: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: { id: string; name: string; email: string; phone: string }) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth on mount
    const token = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');

    // Validate that we have a real token and it's not the string "mock-token"
    if (token && token !== 'mock-token' && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Failed to parse saved user", error);
        logout(); // Clean up if data is corrupted
      }
    } else if (token === 'mock-token') {
      // Clear legacy mock data if it exists
      logout();
    }
    setIsLoading(false);
  }, []);

  const login = (token: string, userData: User) => {
    // 1. Save to localStorage (This keeps you logged in if you refresh)
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(userData));

    // 2. Update React State (This changes "Sign In" to "Profile" immediately)
    setUser(userData);
    console.log("User state updated:", userData);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  return (
      <AuthContext.Provider
          value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            logout,
            updateUser,
          }}
      >
        {children}
      </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};