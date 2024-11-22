import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ Component }) => {
  const { user } = useAuth();

  return user ? <Component /> : <Navigate to="/login" />;
};

export default PrivateRoute;
