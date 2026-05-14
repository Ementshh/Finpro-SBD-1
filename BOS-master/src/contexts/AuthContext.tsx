import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth';
import { auth, db } from '../firebase'; 
import { doc, setDoc } from "firebase/firestore";

interface User {
  id: string;
  name: string;
  email: string;
  role:  | 'parent' | 'teacher'  | 'student';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role:  | 'parent' | 'teacher' | 'student' , nisn?: string, teacherInfo?: {
    schoolName: string;
    teacherId: string;
    department: string;
    district: string;
    subjects: string[];
    gradeLevels: string[];
    yearsExperience: number;
    certifications: string[];
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage (demo user)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string) => {
    setIsLoading(true);
    try {
      // demo user
      const mockUser: User = {
        id: '1',
        name: 'Demo User',
        email: email,
        role: 'parent',
      };
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: 'parent' | 'teacher' | 'student',
    nisn?: string,
    teacherInfo?: {
      schoolName: string;
      teacherId: string;
      department: string;
      district: string;
      subjects: string[];
      gradeLevels: string[];
      yearsExperience: number;
      certifications: string[];
    }
  ) => {
    setIsLoading(true);
    try {
      if (role === 'student' && !nisn) {
        throw new Error("NISN is required for student registration.");
      }
  
      let uid: string;
  
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      uid = user.uid;
  
      if (role === 'student') {
        await setDoc(doc(db, "students", uid), {
          name,
          email,
          nisn,
          role,
          createdAt: new Date(),
        });
      } else if (role === 'teacher') {
        if (!teacherInfo || !teacherInfo.schoolName || !teacherInfo.teacherId) {
          throw new Error("Teacher information is incomplete.");
        }
  
        await setDoc(doc(db, "teacher", uid), {
          name,
          email,
          role,
          schoolName: teacherInfo.schoolName,
          teacherId: teacherInfo.teacherId,
          department: teacherInfo.department || '',
          district: teacherInfo.district || '',
          subjects: teacherInfo.subjects || [],
          gradeLevels: teacherInfo.gradeLevels || [],
          yearsExperience: teacherInfo.yearsExperience || 0,
          certifications: teacherInfo.certifications || [],
          createdAt: new Date(),
        });
      } else if (role === 'parent') {
        await setDoc(doc(db, "parent", uid), {
          name,
          email,
          role,
          createdAt: new Date(),
        });
      } else {
        await setDoc(doc(db, "users", uid), {
          name,
          email,
          role,
          createdAt: new Date(),
        });
      }
  
      await sendEmailVerification(user);
  
      setUser({ id: uid, name, email, role });
      localStorage.setItem("user", JSON.stringify({ id: uid, name, email, role }));
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading, 
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
