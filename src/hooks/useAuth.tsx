
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../lib/types';
import { adminUser, studentUsers } from '../lib/mockData';
import { useToast } from '../hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  registerStudent: (studentData: Omit<User, 'id' | 'role' | 'createdAt'>) => Promise<boolean>;
  isAuthenticated: boolean;
  userRole: UserRole | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Simulate local storage persistence
const getStoredUser = (): User | null => {
  const storedUser = localStorage.getItem('bibliogatekeeper-user');
  return storedUser ? JSON.parse(storedUser) : null;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Check local storage on initial load
  useEffect(() => {
    setLoading(false);
  }, []);

  // Authenticate user with role selection
  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check if admin and role matches
    if (role === 'admin' && email === adminUser.email && password === adminUser.password) {
      setUser(adminUser);
      localStorage.setItem('bibliogatekeeper-user', JSON.stringify(adminUser));
      toast({
        title: "Connecté avec succès",
        description: "Bienvenue dans le système de gestion de bibliothèque",
      });
      setLoading(false);
      return true;
    }
    
    // Check if student and role matches
    if (role === 'student') {
      const student = studentUsers.find(
        (s) => s.email === email && s.password === password
      );
      
      if (student) {
        setUser(student);
        localStorage.setItem('bibliogatekeeper-user', JSON.stringify(student));
        toast({
          title: "Connecté avec succès",
          description: "Bienvenue dans votre espace étudiant",
        });
        setLoading(false);
        return true;
      }
    }
    
    // Failed login
    toast({
      variant: "destructive",
      title: "Échec de connexion",
      description: "Email ou mot de passe incorrect, ou rôle non valide",
    });
    setLoading(false);
    return false;
  };

  // Logout user
  const logout = () => {
    setUser(null);
    localStorage.removeItem('bibliogatekeeper-user');
    toast({
      title: "Déconnecté",
      description: "Vous avez été déconnecté avec succès",
    });
  };

  // Register a new student (admin only)
  const registerStudent = async (studentData: Omit<User, 'id' | 'role' | 'createdAt'>): Promise<boolean> => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check if email already exists
    const exists = studentUsers.some(s => s.email === studentData.email);
    
    if (exists) {
      toast({
        variant: "destructive",
        title: "Erreur d'enregistrement",
        description: "Cet email existe déjà",
      });
      setLoading(false);
      return false;
    }
    
    // Create new student
    const newStudent: User = {
      id: `student-${studentUsers.length + 1}`,
      role: "student",
      createdAt: new Date(),
      ...studentData,
    };
    
    // Add to mock data (in a real app this would be a database call)
    studentUsers.push(newStudent);
    
    toast({
      title: "Étudiant enregistré",
      description: "L'étudiant a été ajouté avec succès",
    });
    
    setLoading(false);
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        registerStudent,
        isAuthenticated: !!user,
        userRole: user?.role || null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
