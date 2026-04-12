import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../context/authContext.jsx'
import { ChatProvider } from '../context/chatContext.jsx'
import { NotificationProvider } from '../context/NotificationContext.jsx'
import VideoCallProvider from "../context/VideoCallContext.jsx";

console.log("main.jsx Loading...");

const root = createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter>
    <AuthProvider>  
      <ChatProvider>
        <NotificationProvider>
          <VideoCallProvider>
            <App />
          </VideoCallProvider>
        </NotificationProvider>
      </ChatProvider>
    </AuthProvider> 
  </BrowserRouter>
);

console.log("main.jsx Rendered");
