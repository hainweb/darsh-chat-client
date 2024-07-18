import axios from 'axios';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { logout, setOnlineUser, setSocketConnection, setUser } from '../redux/userSlice';
import Sidebar from '../components/Sidebar';
import logo from '../assets/logo.png';
import io from 'socket.io-client';

const Home = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch user details from the backend
  const fetchUserDetails = async () => {
    try {
      const URL = `${process.env.REACT_APP_BACKEND_URL}/api/user-details`;
      const response = await axios({
        url: URL,
        withCredentials: true,
      });

      dispatch(setUser(response.data.data));

      if (response.data.data.logout) {
        dispatch(logout());
        navigate('/login'); // Redirect to login if user is logged out
      }
      console.log('Current user details', response);
    } catch (error) {
      console.log('Error', error);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []); // Fetch user details on component mount

  // Socket.IO connection for real-time updates
  useEffect(() => {
    const socketConnection = io(process.env.REACT_APP_BACKEND_URL, {
      auth: {
        token: localStorage.getItem('token'),
      },
    });

    socketConnection.on('onlineUser', (data) => {
      console.log('Online users', data);
      dispatch(setOnlineUser(data)); // Update online user list in Redux store
    });

    dispatch(setSocketConnection(socketConnection)); // Set socket connection in Redux store

    return () => {
      socketConnection.disconnect(); // Disconnect socket on component unmount
    };
  }, []); // Initialize socket connection on component mount

  const basePath = location.pathname === '/';

  return (
    <div className="grid lg:grid-cols-[300px,1fr] h-screen max-h-screen">
      {/* Sidebar */}
      <section className={`bg-white ${!basePath && 'hidden'} lg:block`}>
        <Sidebar />
      </section>

      {/* Main content */}
      <section className={`${basePath && 'hidden'}`}>
        <Outlet />
      </section>

      {/* Logo and additional content */}
      <div className={`justify-center items-center flex-col gap-2 hidden ${!basePath ? 'hidden' : 'lg:flex'}`}>
        <div>
          <img src={logo} width={250} alt="logo" />
        </div>
        <p className="text-lg mt-2 text-slate-500">Select user to send message</p>
      </div>
    </div>
  );
};

export default Home;

