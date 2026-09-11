import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/global.css'
import App from './App.jsx'
import { GameEconomyProvider } from './context/GameEconomyContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <GameEconomyProvider>
        <App />
      </GameEconomyProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
