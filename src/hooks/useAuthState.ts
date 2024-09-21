import { useState, useEffect } from 'react';

export const useAuthState = () => {
  const [role, setRole] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const checkAuthState = () => {
      const userString = localStorage.getItem('userLogin');
      const accessToken = localStorage.getItem('accessToken');

      if (userString && accessToken) {
        try {
          const user = JSON.parse(userString);
          setRole(user.roleName.toUpperCase());
          setIsLoggedIn(true);
          setUserName(user.name || '');
        } catch (error) {
          console.error('Error parsing user data:', error);
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
        setRole('');
        setUserName('');
      }
    };

    checkAuthState();

    window.addEventListener('storage', checkAuthState);
    return () => window.removeEventListener('storage', checkAuthState);
  }, []);

  return { role, isLoggedIn, userName };
};