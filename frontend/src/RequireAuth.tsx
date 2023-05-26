// Imports
import React, { useEffect, useState, ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import ScaleLoader from 'react-spinners/ScaleLoader';
import { authenticateUser } from './api/backendApiCalls';
import { retryUntilSuccess } from './utils/helpers';

// Prop Type
type RequireAuthProps = {
  children: ReactElement;
}

// Main Component
function RequireAuth({ children }: RequireAuthProps): ReactElement | null {
  const [authenticated, setAuthenticated] = useState(false);
  const [authCheckFinished, setAuthCheckFinished] = useState(false);

  useEffect(() => {
    retryUntilSuccess(
      () => authenticateUser(),
    )
      .then((data) => {
        setAuthenticated(data.authenticated);
        setAuthCheckFinished(true);
      });
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
