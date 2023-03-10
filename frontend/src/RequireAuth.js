import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import ScaleLoader from 'react-spinners/ScaleLoader';
import ApiInfo from './config.json';

const BACKEND_URL = process.env.REACT_APP_API_URL;

function RequireAuth({children}) {
    const [authenticated, setAuthenticated] = useState(false);
    const [authCheckFinished, setAuthCheckFinished] = useState(false);
    const api_url = BACKEND_URL + '/api/authenticate';

    useEffect(() => {
        const checkAuth = async () => {
          const response = await fetch(api_url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include'
          });
          const data = await response.json();
          setAuthenticated(data.authenticated);
          setAuthCheckFinished(true);
        };
        checkAuth();
      }, []);
    
    if (!authCheckFinished) {
        return <ScaleLoader color={'#ffffff'} size={150} />;
    } else if (!authenticated) {
        return <Navigate to="/" />;
    } else {
        return children;
    }
};

export default RequireAuth;