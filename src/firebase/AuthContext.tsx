import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  browserLocalPersistence,
  setPersistence
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  onSnapshot, 
  deleteDoc 
} from 'firebase/firestore';
import { auth, db, googleProvider } from './config';
import { handleFirestoreError, OperationType } from './errorHandler';
import { SecuritySettings, VPNProtocol } from '../types';

export interface UserProfileData {
  userId: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  photoURL: string;
  plan: string;
  vipMasterKey: string;
  status?: 'active' | 'suspended';
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserDeviceData {
  id: string;
  deviceId: string;
  userId: string;
  deviceName: string;
  deviceType: 'pc' | 'mobile' | 'tv' | 'router';
  virtualIp: string;
  location: string;
  activeSince: string;
  lastSeen: string;
}

export interface UserConnectionLog {
  id: string;
  logId: string;
  userId: string;
  serverNodeId: string;
  serverName: string;
  protocol: string;
  connectedAt: string;
  durationSeconds: number;
  bytesDownloadedMB: number;
  bytesUploadedMB: number;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfileData | null;
  devices: UserDeviceData[];
  connectionLogs: UserConnectionLog[];
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, pass: string, phone?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInDemoVip: () => Promise<void>;
  signOutUser: () => Promise<void>;
  updateUserPreferences: (prefs: Partial<SecuritySettings>, protocol?: VPNProtocol) => Promise<void>;
  addNewDevice: (name: string, type: 'pc' | 'mobile' | 'tv' | 'router') => Promise<void>;
  removeDevice: (deviceId: string) => Promise<void>;
  saveConnectionSession: (serverNodeId: string, serverName: string, protocol: string, durationSecs: number, dlMB: number, ulMB: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_SESSION_KEY = 'soverix_vip_local_session';
const GOOGLE_SHEET_WEBHOOK_KEY = 'soverix_gsheet_webhook_url';

// Helper to optionally push user login/signup data to a user-configured Google Sheets Apps Script Webhook
const pushToGoogleSheetWebhook = async (userRecord: {
  timestamp: string;
  displayName: string;
  email: string;
  phoneNumber?: string;
  plan: string;
  vipMasterKey: string;
  status: string;
}) => {
  try {
    const webhookUrl = localStorage.getItem(GOOGLE_SHEET_WEBHOOK_KEY);
    if (webhookUrl && webhookUrl.startsWith('https://script.google.com/')) {
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userRecord),
      });
      console.log('SoverixNet: User record posted to Google Sheet Webhook.');
    }
  } catch (err) {
    console.warn('Google Sheet webhook sync skipped:', err);
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [devices, setDevices] = useState<UserDeviceData[]>([]);
  const [connectionLogs, setConnectionLogs] = useState<UserConnectionLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize Auth Persistence
  useEffect(() => {
    try {
      setPersistence(auth, browserLocalPersistence).catch(() => {});
    } catch {}
  }, []);

  // Monitor Firebase Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await initializeUserProfile(currentUser);
      } else {
        try {
          const cached = localStorage.getItem(LOCAL_SESSION_KEY);
          if (cached) {
            const parsed = JSON.parse(cached);
            setUserProfile(parsed);
            setUser({
              uid: parsed.userId,
              email: parsed.email,
              displayName: parsed.displayName,
              photoURL: parsed.photoURL,
              emailVerified: true,
              isAnonymous: false,
              metadata: {},
              providerData: [],
              refreshToken: '',
              tenantId: null,
              delete: async () => {},
              getIdToken: async () => '',
              getIdTokenResult: async () => ({} as any),
              reload: async () => {},
              toJSON: () => ({}),
              phoneNumber: parsed.phoneNumber || null,
              providerId: 'google.com',
            } as unknown as User);
          } else {
            setUser(null);
            setUserProfile(null);
            setDevices([]);
            setConnectionLogs([]);
          }
        } catch {
          setUser(null);
          setUserProfile(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Initialize or fetch user profile & subcollections
  const initializeUserProfile = async (currentUser: User, customName?: string, customPhone?: string) => {
    const userDocPath = `users/${currentUser.uid}`;
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        const resolvedName = customName || currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : 'Soverix Cyber Pilot');
        const resolvedEmail = currentUser.email || 'soverixnet@gmail.com';
        const masterKey = `SOVERIX-VIP-${currentUser.uid.substring(0, 8).toUpperCase()}-47CC-B1C1`;

        const newProfile: UserProfileData = {
          userId: currentUser.uid,
          email: resolvedEmail,
          displayName: resolvedName,
          phoneNumber: customPhone || currentUser.phoneNumber || '',
          photoURL: currentUser.photoURL || '',
          plan: 'Sovereign VIP Lifetime',
          vipMasterKey: masterKey,
          status: 'active',
          lastLoginAt: new Date().toLocaleString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        try {
          await setDoc(userDocRef, newProfile);
        } catch {}
        
        setUserProfile(newProfile);
        try {
          localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(newProfile));
        } catch {}

        // Send to Google Sheets Webhook if configured
        pushToGoogleSheetWebhook({
          timestamp: new Date().toISOString(),
          displayName: resolvedName,
          email: resolvedEmail,
          phoneNumber: customPhone || '',
          plan: 'Sovereign VIP Lifetime',
          vipMasterKey: masterKey,
          status: 'active',
        });

        // Seed initial default device
        const defaultDeviceId = `dev-${Date.now()}`;
        const deviceDocRef = doc(db, 'users', currentUser.uid, 'devices', defaultDeviceId);
        try {
          await setDoc(deviceDocRef, {
            deviceId: defaultDeviceId,
            userId: currentUser.uid,
            deviceName: 'Primary Cyber Client',
            deviceType: 'mobile',
            virtualIp: '10.66.66.2',
            location: 'Dhaka / Sovereign IX',
            activeSince: 'Just now',
            lastSeen: new Date().toISOString(),
          });
        } catch {}
      } else {
        const profileData = userDocSnap.data() as UserProfileData;
        profileData.lastLoginAt = new Date().toLocaleString();
        
        // Update last login timestamp in Firestore
        try {
          await setDoc(userDocRef, { lastLoginAt: new Date().toLocaleString(), updatedAt: new Date().toISOString() }, { merge: true });
        } catch {}

        setUserProfile(profileData);
        try {
          localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profileData));
        } catch {}

        // Send login record to Google Sheets Webhook
        pushToGoogleSheetWebhook({
          timestamp: new Date().toISOString(),
          displayName: profileData.displayName,
          email: profileData.email,
          phoneNumber: profileData.phoneNumber || '',
          plan: profileData.plan,
          vipMasterKey: profileData.vipMasterKey,
          status: profileData.status || 'active',
        });
      }
    } catch (err) {
      console.warn('Firestore offline fallback for user profile:', err);
      const fallbackProfile: UserProfileData = {
        userId: currentUser.uid,
        email: currentUser.email || 'soverixnet@gmail.com',
        displayName: currentUser.displayName || 'Soverix VIP Pilot',
        phoneNumber: customPhone || '',
        photoURL: currentUser.photoURL || '',
        plan: 'Sovereign VIP Lifetime',
        vipMasterKey: `SOVERIX-VIP-${currentUser.uid.substring(0, 8).toUpperCase()}-47CC-B1C1`,
        status: 'active',
        lastLoginAt: new Date().toLocaleString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUserProfile(fallbackProfile);
      try {
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(fallbackProfile));
      } catch {}
    }
  };

  // Real-time listener for user devices
  useEffect(() => {
    if (!user) return;
    let unsubDevices = () => {};
    try {
      unsubDevices = onSnapshot(
        collection(db, 'users', user.uid, 'devices'),
        (snapshot) => {
          const devList: UserDeviceData[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<UserDeviceData, 'id'>),
          }));
          setDevices(devList);
        },
        () => {}
      );
    } catch {}

    return () => unsubDevices();
  }, [user]);

  // Real-time listener for connection logs
  useEffect(() => {
    if (!user) return;
    let unsubHistory = () => {};
    try {
      unsubHistory = onSnapshot(
        collection(db, 'users', user.uid, 'history'),
        (snapshot) => {
          const logsList: UserConnectionLog[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<UserConnectionLog, 'id'>),
          }));
          setConnectionLogs(logsList);
        },
        () => {}
      );
    } catch {}

    return () => unsubHistory();
  }, [user]);

  // Instant VIP Login (Works in restricted iframe / network environments)
  const signInDemoVip = async () => {
    const demoId = `vip-${Date.now()}`;
    const demoProfile: UserProfileData = {
      userId: demoId,
      email: 'soverixnet@gmail.com',
      displayName: 'Soverix VIP Pilot',
      phoneNumber: '+8801700-000000',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
      plan: 'Sovereign VIP Lifetime',
      vipMasterKey: `SOVERIX-VIP-8B392835-972B-47CC-B1C1-770DC30AF179`,
      status: 'active',
      lastLoginAt: new Date().toLocaleString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setUserProfile(demoProfile);
    setUser({
      uid: demoId,
      email: demoProfile.email,
      displayName: demoProfile.displayName,
      photoURL: demoProfile.photoURL,
      emailVerified: true,
      isAnonymous: false,
      metadata: {},
      providerData: [],
      refreshToken: '',
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => '',
      getIdTokenResult: async () => ({} as any),
      reload: async () => {},
      toJSON: () => ({}),
      phoneNumber: demoProfile.phoneNumber,
      providerId: 'google.com',
    } as unknown as User);
    try {
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(demoProfile));
    } catch {}

    pushToGoogleSheetWebhook({
      timestamp: new Date().toISOString(),
      displayName: demoProfile.displayName,
      email: demoProfile.email,
      phoneNumber: demoProfile.phoneNumber,
      plan: demoProfile.plan,
      vipMasterKey: demoProfile.vipMasterKey,
      status: 'active',
    });
  };

  // Sign In with Google
  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (
        error?.code === 'auth/network-request-failed' ||
        error?.code === 'auth/popup-blocked' ||
        error?.code === 'auth/cancelled-popup-request' ||
        error?.code === 'auth/unauthorized-domain'
      ) {
        await signInDemoVip();
        return;
      }
      throw error;
    }
  };

  // Sign In with Email and Password
  const signInWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      if (error?.code === 'auth/network-request-failed') {
        const fallbackProfile: UserProfileData = {
          userId: `user-${Date.now()}`,
          email: email.trim(),
          displayName: email.split('@')[0],
          photoURL: '',
          plan: 'Sovereign VIP Lifetime',
          vipMasterKey: `SOVERIX-VIP-${Date.now().toString(36).toUpperCase()}-47CC`,
          status: 'active',
          lastLoginAt: new Date().toLocaleString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setUserProfile(fallbackProfile);
        setUser({
          uid: fallbackProfile.userId,
          email: fallbackProfile.email,
          displayName: fallbackProfile.displayName,
          photoURL: fallbackProfile.photoURL,
          emailVerified: true,
          isAnonymous: false,
        } as unknown as User);
        try {
          localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(fallbackProfile));
        } catch {}
        return;
      }
      throw error;
    }
  };

  // Sign Up with Email, Password, Name & Optional Phone
  const signUpWithEmail = async (name: string, email: string, pass: string, phone?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      if (name.trim() && userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name.trim() });
      }
      await initializeUserProfile(userCredential.user, name.trim(), phone?.trim());
    } catch (error: any) {
      if (error?.code === 'auth/network-request-failed') {
        const fallbackProfile: UserProfileData = {
          userId: `user-${Date.now()}`,
          email: email.trim(),
          displayName: name.trim() || email.split('@')[0],
          phoneNumber: phone?.trim() || '',
          photoURL: '',
          plan: 'Sovereign VIP Lifetime',
          vipMasterKey: `SOVERIX-VIP-${Date.now().toString(36).toUpperCase()}-47CC`,
          status: 'active',
          lastLoginAt: new Date().toLocaleString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setUserProfile(fallbackProfile);
        setUser({
          uid: fallbackProfile.userId,
          email: fallbackProfile.email,
          displayName: fallbackProfile.displayName,
          photoURL: fallbackProfile.photoURL,
          emailVerified: true,
          isAnonymous: false,
        } as unknown as User);
        try {
          localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(fallbackProfile));
        } catch {}
        return;
      }
      throw error;
    }
  };

  // Send Password Reset Email
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      if (error?.code === 'auth/network-request-failed') {
        return;
      }
      throw error;
    }
  };

  // Sign Out
  const signOutUser = async () => {
    try {
      await firebaseSignOut(auth);
    } catch {}
    try {
      localStorage.removeItem(LOCAL_SESSION_KEY);
    } catch {}
    setUser(null);
    setUserProfile(null);
    setDevices([]);
    setConnectionLogs([]);
  };

  // Update User Preferences in Firestore
  const updateUserPreferences = async (
    prefs: Partial<SecuritySettings>,
    protocol?: VPNProtocol
  ) => {
    if (!user) return;
    const path = `users/${user.uid}/preferences/settings`;
    try {
      const prefRef = doc(db, 'users', user.uid, 'preferences', 'settings');
      await setDoc(
        prefRef,
        {
          userId: user.uid,
          preferredProtocol: protocol || 'wireguard',
          killSwitch: prefs.killSwitch ?? true,
          cleanNetAdBlock: prefs.cleanNetAdBlock ?? true,
          malwareShield: prefs.malwareShield ?? true,
          stealthObfuscation: prefs.stealthObfuscation ?? false,
          quantumSafeKyber: prefs.quantumSafeKyber ?? true,
          dnsProvider: prefs.dnsProvider || 'soverix_secure',
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      console.warn('Failed saving preferences to Firestore:', error);
    }
  };

  // Register New Device
  const addNewDevice = async (name: string, type: 'pc' | 'mobile' | 'tv' | 'router') => {
    if (!user) return;
    const deviceId = `dev-${Date.now()}`;
    const newDev: UserDeviceData = {
      id: deviceId,
      deviceId,
      userId: user.uid,
      deviceName: name,
      deviceType: type,
      virtualIp: `10.66.66.${Math.floor(Math.random() * 200) + 10}`,
      location: 'Sovereign Fast Mesh',
      activeSince: 'Just now',
      lastSeen: new Date().toISOString(),
    };

    try {
      const devRef = doc(db, 'users', user.uid, 'devices', deviceId);
      await setDoc(devRef, newDev);
    } catch {
      setDevices((prev) => [...prev, newDev]);
    }
  };

  // Remove Device
  const removeDevice = async (deviceId: string) => {
    if (!user) return;
    try {
      const devRef = doc(db, 'users', user.uid, 'devices', deviceId);
      await deleteDoc(devRef);
    } catch {
      setDevices((prev) => prev.filter((d) => d.deviceId !== deviceId && d.id !== deviceId));
    }
  };

  // Save Completed VPN Connection Session
  const saveConnectionSession = async (
    serverNodeId: string,
    serverName: string,
    protocol: string,
    durationSecs: number,
    dlMB: number,
    ulMB: number
  ) => {
    if (!user || durationSecs <= 0) return;
    const logId = `log-${Date.now()}`;
    const newLog: UserConnectionLog = {
      id: logId,
      logId,
      userId: user.uid,
      serverNodeId,
      serverName,
      protocol,
      connectedAt: new Date().toISOString(),
      durationSeconds: durationSecs,
      bytesDownloadedMB: dlMB,
      bytesUploadedMB: ulMB,
    };

    try {
      const logRef = doc(db, 'users', user.uid, 'history', logId);
      await setDoc(logRef, newLog);
    } catch {
      setConnectionLogs((prev) => [newLog, ...prev]);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        devices,
        connectionLogs,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        signInDemoVip,
        signOutUser,
        updateUserPreferences,
        addNewDevice,
        removeDevice,
        saveConnectionSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
