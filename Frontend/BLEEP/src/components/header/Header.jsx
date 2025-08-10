import React from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logout } from '../../slice/authSlice'

const Header = () => {
  const navigate=useNavigate()
  const dispatch=useDispatch()

  const handleLogout=()=>{
    dispatch(logout())
    navigate('/login')
  }
  return (
    <>

      <div className=''>
        <div className='flex justify-center fixed bottom-20 left-0 right-0 mb-4'>
          <div className='flex justify-center bg-transparent rounded-3xl w-6/12'>
            <div className='p-6 font-bold text-xl hover:text-blue-400 hover:underline' onClick={()=>navigate('/')}>Home</div>
            <div className='p-6 font-bold text-xl hover:text-blue-400 hover:underline' onClick={()=>navigate('/register')}>Register</div>
            <div className='p-6 font-bold text-xl hover:text-blue-400 hover:underline' onClick={()=>navigate('/login')}>Login</div>
            <div className='p-6 font-bold text-xl hover:text-blue-400 hover:underline' onClick={handleLogout}>Logout</div>
            <div className='p-6 font-bold text-xl hover:text-blue-400 hover:underline' onClick={()=>navigate('/chat')}>Chat</div>
          </div>
        </div>
      </div>

    </>
  )
}

export default Header