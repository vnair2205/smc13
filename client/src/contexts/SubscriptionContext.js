// client/src/contexts/SubscriptionContext.js
import React, { createContext, useState, useContext, useCallback } from 'react';
import api from '../utils/api';

const SubscriptionContext = createContext();

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider = ({ children }) => {
  const [isSubscribed, setIsSubscribed] = useState(true); // Assume subscribed initially
  const [isLoading, setIsLoading] = useState(true);

  const checkSubscriptionStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/subscriptions/status');
      setIsSubscribed(data.isActive);
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      setIsSubscribed(false); // Default to not subscribed on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = {
    isSubscribed,
    isLoading,
    checkSubscriptionStatus,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};