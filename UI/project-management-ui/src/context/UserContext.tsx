import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
}

interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    activeProject: string | null;
    setActiveProject: (projectId: string | null) => void;
    logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [activeProject, setActiveProject] = useState<string | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedProject = localStorage.getItem('activeProject');
        
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        
        if (storedProject) {
            setActiveProject(storedProject);
        }
    }, []);

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('activeProject');
        setUser(null);
        setActiveProject(null);
    };

    const updateActiveProject = (projectId: string | null) => {
        setActiveProject(projectId);
        if (projectId) {
            localStorage.setItem('activeProject', projectId);
        } else {
            localStorage.removeItem('activeProject');
        }
    };

    return (
        <UserContext.Provider value={{
            user,
            setUser,
            activeProject,
            setActiveProject: updateActiveProject,
            logout
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};