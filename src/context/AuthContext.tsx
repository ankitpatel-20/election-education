import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  favorites: string[];
  homeCountry: string | null;
  logout: () => Promise<void>;
  toggleFavorite: (countryId: string) => Promise<void>;
  updateHomeCountry: (countryId: string) => Promise<void>;
  bypassLogin: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  favorites: [],
  homeCountry: null,
  logout: async () => {},
  toggleFavorite: async () => {},
  updateHomeCountry: async () => {},
  bypassLogin: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [homeCountry, setHomeCountry] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          setFavorites(data.favoriteCountries || []);
          setHomeCountry(data.homeCountryId || null);
        } else {
            // Profile will be created by the login page with selected country
            setFavorites(['in', 'us', 'gb']);
        }
        setUser(user);
      } else {
        setUser(null);
        setFavorites([]);
        setHomeCountry(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const bypassLogin = () => {
    setUser({ uid: 'guest-user', email: 'guest@civicmind.local', displayName: 'Guest User', photoURL: '' } as User);
    setFavorites(['in', 'us', 'gb']);
    setHomeCountry('us');
    setLoading(false);
  };

  const updateHomeCountry = async (countryId: string) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    setHomeCountry(countryId);
    await setDoc(userRef, { 
      homeCountryId: countryId,
      updatedAt: serverTimestamp() 
    }, { merge: true });
  };

  const toggleFavorite = async (countryId: string) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    const newFavorites = favorites.includes(countryId)
      ? favorites.filter(id => id !== countryId)
      : [...favorites, countryId];
    
    setFavorites(newFavorites);
    await setDoc(userRef, { 
      favoriteCountries: newFavorites,
      updatedAt: serverTimestamp() 
    }, { merge: true });
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, favorites, homeCountry, logout, toggleFavorite, updateHomeCountry, bypassLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
