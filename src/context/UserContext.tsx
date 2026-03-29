import React, { createContext, useContext, useState, ReactNode } from 'react';

// Type definition for user data
export interface UserData {
    name: string;
    email: string;
    dob: string;
    height: string;
    weight: string;
    wellnessScore: number;
    plan: string;
    stats: {
        heartRate: number;
        steps: number;
        calories: number;
        sleep: number;
    };
    monthlyGoals: {
        fatLoss: number;
        muscleMass: { current: number; goal: number };
        vo2Max: { current: number; goal: number };
    };
    recommendation: string;
}

interface UserContextType {
    userData: UserData;
    setUserData: React.Dispatch<React.SetStateAction<UserData>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode; initialData: UserData }> = ({ children, initialData }) => {
    const [userData, setUserData] = useState<UserData>(initialData);

    return (
        <UserContext.Provider value={{ userData, setUserData }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

export default UserContext;
