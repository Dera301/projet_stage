import { useEffect } from 'react';

function App() {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Vérifier le token auprès du backend
      fetch('/api/verify-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (!data.valid) {
          localStorage.removeItem('token');
          // Déconnecter l'utilisateur
        }
        // Sinon, garder l'utilisateur connecté
      });
    }
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>React App</h1>
      </header>
      <main>
        <p>Content of the app</p>
      </main>
    </div>
  );
}

export default App;