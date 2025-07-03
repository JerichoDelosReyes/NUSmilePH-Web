import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App as AntDApp } from 'antd'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { UserProvider } from './Component/Context/UserContext.jsx'
import {NavigationProvider} from './Component/Custom Hooks/NavigationProvider.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NavigationProvider>
      <UserProvider>
        <AntDApp>
        <BrowserRouter>
          <App />
        </BrowserRouter>
        </AntDApp>
      </UserProvider>
    </NavigationProvider>
  </StrictMode>,
)
