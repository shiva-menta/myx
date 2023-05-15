import React from 'react';

function DeniedAccessPage() {
  // Render Function
  return (
    <div className="denied-access-page">
      <div className="section-text">
        {'You have not been authenticated to use this app. Please register for access\u00a0'}
        <a href="https://forms.gle/pabr5hVKuHSQqk999" target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'underline' }}>
          here
        </a>
        .
      </div>
    </div>
  );
}

export default DeniedAccessPage;
