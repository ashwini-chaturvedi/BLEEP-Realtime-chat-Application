import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route
} from 'react-router-dom';
import './index.css';
import Layout from './Layout.jsx';
import { Home, Register, Login, Profile, Chat,AddFriends,EditProfile } from './components/AllComponents.js';
import { store } from './store/store.js';
import { Provider } from 'react-redux';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<Home />} />
      <Route path="/register" element={<Register />} />   {/* ✅ no leading slash */}
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/addFriends" element={<AddFriends />} />
      <Route path="/editProfile" element={<EditProfile />} />
    </Route>
  )
);


createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
);
