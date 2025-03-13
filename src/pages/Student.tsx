
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar } from '../components/NavBar';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';

const Student = () => {
  const { isAuthenticated, userRole, user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Protect student route
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    } else if (userRole !== 'student') {
      navigate('/admin');
    }
  }, [isAuthenticated, userRole, navigate]);
  
  if (!isAuthenticated || userRole !== 'student') {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b py-4 px-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-medium text-purple-500">Bibliothèque ISET Tozeur</h1>
            <p className="text-sm text-gray-500">Portail de {user?.firstName?.toLowerCase()} {user?.lastName?.toLowerCase()}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="text-red-500 flex items-center"
          >
            <span className="mr-2">Déconnexion</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm5 4a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zm0 4a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </header>
      
      <main className="flex-1 p-6">
        <Card className="border border-gray-200 rounded-md">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2">Bienvenue dans votre espace étudiant</h2>
            <p className="text-gray-600">
              L'accès aux livres est temporairement désactivé. Merci de votre compréhension.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Student;
