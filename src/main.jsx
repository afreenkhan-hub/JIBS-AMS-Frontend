import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './styles/app.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { AssignedAssetsProvider } from './context/AssignedAssetsContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AssignedAssetsProvider>
          <App />
        </AssignedAssetsProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
