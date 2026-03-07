import { useState } from 'react' 
import Register from './pages/Register'
import Login from './pages/Login'
import { Routes, Route } from "react-router-dom"
import Chat from './pages/Chat'
// import Chat from './pages/tempchat'
import ProtectedRoute from './components/ProtectedRoute'
// import Navbar from './sections/Navbar'



function App() {
   const [count, setCount] = useState(0)

   return (
      <div className='font-poppins'>
         {/* <Navbar/> */}
         <Routes>
            <Route path="/" element={
               <ProtectedRoute>
                  <Chat />
               </ProtectedRoute>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/chat" element={
               <ProtectedRoute>
                  <Chat />
               </ProtectedRoute>
            } />
         </Routes>
      </div>
   )
}

export default App
