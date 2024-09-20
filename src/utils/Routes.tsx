import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path='/' element={<HomeScreen/>}/>
      <Route path="/login" element={<LoginScreen />} />
      {/* Add other routes here */}
    </Routes>
  );
};

export default AppRoutes;