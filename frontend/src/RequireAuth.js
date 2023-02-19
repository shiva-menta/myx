import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import ScaleLoader from 'react-spinners/ScaleLoader';

function RequireAuth({children}) {
    const [authenticated, setAuthenticated] = useState(false);
    const [authCheckFinished, setAuthCheckFinished] = useState(false);
    const api_url = 'http://127.0.0.1:5000/api/authenticate';

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