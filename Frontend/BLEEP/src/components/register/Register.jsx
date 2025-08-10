import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { MdAlternateEmail } from "react-icons/md";
import { BleepLoader,Login } from '../AllComponents';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';



// A placeholder for your logo
const Logo = () => (
    <svg className="h-12 w-auto text-gray-800" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5-10-5-10 5z" />
    </svg>
);


// --- Main Page Components ---

const RegisterComponent = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate=useNavigate()

  const onSubmit = (data) => {
    console.log("Registration Data:", data);
   
    navigate('/login')
  };

  return (
    <div className="w-full lg:w-1/2 p-8 md:p-12">
      <div className="flex items-center mb-8">
        <Logo />
        <h1 className="text-3xl font-bold ml-4">Create Your Account</h1>
      </div>

      <p className="text-gray-600 mb-8">
        Join our community! Fill out the form below to get started.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Form Fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type='text'
            {...register("fullName", { required: "Full name is required" })}
            className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition'
            placeholder='Ashwini Chaturvedi'
          />
          {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
        </div>

        <div>
          
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <div></div>
          <input
          
            type='email'
            {...register("email", { required: "Email is required" })}
            className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition'
            placeholder='ashwinichaturvedi8924@gmail.com'
            
          />
          
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">User Name</label>
          <input
            type='text'
            {...register("userName", { required: "UserName is required" })}
            className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition'
            placeholder='ashwini@123'
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type='password'
            {...register("password", { required: "Password is required", minLength: 6 })}
            className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition'
            placeholder='••••••••'
          />
           {errors.password && <p className="text-red-500 text-xs mt-1">Password must be at least 6 characters.</p>}
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className='w-full bg-gradient-to-t from-black to-gray-400 text-white text-xl font-extrabold p-3 rounded-lg shadow-lg hover:bg-green-700 transition-colors'
        >
          Create Account
        </motion.button>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-sm text-gray-500">Or continue with</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* OAuth-2 Logins */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }} type="button" className='flex items-center justify-center p-3 font-bold border border-gray-300 rounded-lg hover:bg-gray-50 transition hover:bg-gradient-to-b from-black to-gray-300 hover:text-white'>
            <FcGoogle size={24} className='mr-3' />
            <span className='font-semibold  '>Google</span>
          </motion.button>

          <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }} type="button" className='flex items-center justify-center p-3 font-bold border border-gray-300 rounded-lg hover:bg-gray-50 transition hover:bg-gradient-to-b from-black to-gray-300 hover:text-white'>
            <FaGithub size={24} className='mr-3' />
            <span className='font-semibold  '>Github</span>
          </motion.button>
        </div>

        {/* Link to Login */}
        <p className="text-center text-sm text-gray-600 mt-8">
          Already have an account?{' '}
          <span
            onClick={()=>navigate('/login')}
            className="font-semibold text-green-600 hover:underline cursor-pointer"
          >
            Log in here
          </span>
        </p>
      </form>
    </div>
  );
};


const App = () => {
  return (
    <main className="font-sans bg-gray-100 min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl flex flex-col lg:flex-row overflow-hidden"
      >
        {/* Left Side - Illustration and Branding */}
        <div className="w-full lg:w-1/2 bg-gradient-to-b from-black to-gray-300 p-8 md:p-12 flex flex-col justify-center items-center text-center">
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8, type: 'spring', stiffness: 120 }}
            >
                <div className="">
                  <BleepLoader />
                </div>
                <h2 className="text-4xl font-bold  mt-8 text-yellow-400">
                    Start Your Journey
                </h2>
                <p className=" mt-4 max-w-md mx-auto text-lg text-white">
                    Create an account to connect to your Family,Friends and Peers.
                    
                </p>
                
            </motion.div>
        </div>

        
          <RegisterComponent />
        
      </motion.div>
    </main>
  );
};

export default App;
