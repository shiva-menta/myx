// Imports
import React, { useEffect, useState, ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import ScaleLoader from 'react-spinners/ScaleLoader';

const BACKEND_URL = process.env.REACT_APP_API_URL;

// Prop Type
type RequireAuthProps = {
  children: ReactElement;
}

// Main Component
function RequireAuth({ children }: RequireAuthProps): ReactElement | null {
  const [authenticated, setAuthenticated] = useState(false);
  const [authCheckFinished, setAuthCheckFinished] = useState(false);
  const apiUrl = `${BACKEND_URL}/api/authenticate`;

  useEffect(() => {
    const checkAuth = async () => {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      const data = await response.json();
      setAuthenticated(data.authenticated);
      setAuthCheckFinished(true);
    };
    checkAuth();
  }, []);

  // Render Function
  if (!authCheckFinished) {
    return (
      <div className="loader-container">
        <ScaleLoader color="#ffffff" height={50} width={5} />
      </div>
    );
  } else if (!authenticated) {
    return <Navigate to="/" />;
  } else {
    return children;
  }
}

export default RequireAuth;
