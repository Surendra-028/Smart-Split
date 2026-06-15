import React, { createContext, useEffect, useState } from 'react';
import { jwtDecode } from "jwt-decode";
import axios from 'axios';
import { toast } from 'react-toastify';

export const StoreContext = createContext(null);

export default function StoreContextProvider({ children }) {
  const url = "https://smart-split-o5px.onrender.com";
  const [activePage, setActivePage] = useState('landingpage');
  const [token, setToken] = useState('');
  const [user, setUser] = useState({
    id: '',
    name: '',
    email: '',
    balance: 1000,
    iOwe: 0,
    owedToMe: 0
  });

  const handleGetDetails = async (tokenToUse) => {
    try {
      if (!tokenToUse) return;
      
      const decode = jwtDecode(tokenToUse);
      const id = decode.id;
      
      const Response = await axios.get(`${url}/api/user/${id}`);
      
      if (Response.data.success) {
        const userData = Response.data.user;
        setUser({
          id: userData._id,
          name: userData.name,
          email: userData.email,
          balance: userData.balance || 0,
          iOwe: userData.iOwe || 0,
          owedToMe: userData.owedToMe || 0
        });
      } else {
        toast.error(Response.data.error || "Failed to fetch profile updates");
      }
    } catch (error) {
      console.error("Token decoding or fetching failed:", error);
      localStorage.removeItem('token');
      setToken('');
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      handleGetDetails(savedToken);
      setActivePage('dashboard');
    }
  }, []);

  const contextValue = {
    activePage,
    setActivePage,
    user,
    setUser,
    token,
    setToken,
    url,
    handleGetDetails
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
}
