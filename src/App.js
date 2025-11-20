import { useEffect, useState } from 'react';
import { getToken, removeToken } from './services/auth';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (token) {
      fetch('/api/verify-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.valid) {
          setIsAuthenticated(true);
        } else {
          removeToken();
          setIsAuthenticated(false);
        }
      });
    }
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>React App</h1>
      </header>
      <main>
        <div className="content">
          <p>Welcome to React App</p>
        </div>
      </main>
    </div>
  );
}

export default App;