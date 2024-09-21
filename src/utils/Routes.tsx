import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import EnrollScreen from '../screens/EnrollScreen';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path='/' element={<HomeScreen/>}/>
      <Route path="/login" element={<LoginScreen />} />
      <Route path='/enroll' element={<EnrollScreen/>}/>
    </Routes>
  );
};

export default AppRoutes;