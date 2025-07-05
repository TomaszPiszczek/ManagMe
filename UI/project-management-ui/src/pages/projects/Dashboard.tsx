import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import UsersList from '../../components/users/UsersList';
import ProjectsView from '../../components/projects/ProjectsView';

type ViewType = 'users' | 'projects';

const Dashboard = () => {
    const [currentView, setCurrentView] = useState<ViewType>('projects');
    const [resetKey, setResetKey] = useState(0);
    const { user, logout } = useUser();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const renderContent = () => {
        switch (currentView) {
            case 'users':
                return <UsersList />;
            case 'projects':
                return <ProjectsView key={resetKey} />;
            default:
                return <ProjectsView key={resetKey} />;
        }
    };

    return (
        <div style={{minHeight: '100vh', backgroundColor: '#111827', display: 'flex'}}>
            <div style={{width: '15%', minWidth: '150px', backgroundColor: '#111827', display: 'flex', flexDirection: 'column'}}>
                <div style={{padding: '24px', borderBottom: '1px solid #374151'}}>
                    <button 
                        onClick={() => {
                            setCurrentView('projects');
                            setResetKey(prev => prev + 1);
                        }}
                        style={{
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            width: '100%',
                            textAlign: 'left'
                        }}
                    >
                        <svg style={{width: '40px', height: '40px', color: '#10b981'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 style={{fontSize: '20px', fontWeight: '600', color: 'white'}}>Manage Me</h2>
                    </button>
                </div>
                
                <nav style={{paddingTop: '16px', paddingBottom: '16px', flex: 1}}>
                    <button
                        onClick={() => setCurrentView('projects')}
                        style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '12px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            background: currentView === 'projects' 
                                ? 'linear-gradient(to right, #10b981, #374151)' 
                                : 'transparent',
                            color: currentView === 'projects' ? 'white' : '#d1d5db',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            if (currentView !== 'projects') {
                                (e.target as HTMLElement).style.backgroundColor = '#1f2937';
                                (e.target as HTMLElement).style.color = 'white';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (currentView !== 'projects') {
                                (e.target as HTMLElement).style.backgroundColor = 'transparent';
                                (e.target as HTMLElement).style.color = '#d1d5db';
                            }
                        }}
                    >
                        <svg style={{width: '20px', height: '20px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <span>Projects</span>
                    </button>
                    {user?.role === 'ADMIN' && (
                        <button
                            onClick={() => setCurrentView('users')}
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                padding: '12px 16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                background: currentView === 'users' 
                                    ? 'linear-gradient(to right, #10b981, #374151)' 
                                    : 'transparent',
                                color: currentView === 'users' ? 'white' : '#d1d5db',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                if (currentView !== 'users') {
                                    (e.target as HTMLElement).style.backgroundColor = '#1f2937';
                                    (e.target as HTMLElement).style.color = 'white';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (currentView !== 'users') {
                                    (e.target as HTMLElement).style.backgroundColor = 'transparent';
                                    (e.target as HTMLElement).style.color = '#d1d5db';
                                }
                            }}
                        >
                            <svg style={{width: '20px', height: '20px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                            <span>Team</span>
                        </button>
                    )}
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '12px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            background: 'transparent',
                            color: '#fca5a5',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            (e.target as HTMLElement).style.backgroundColor = '#7f1d1d';
                            (e.target as HTMLElement).style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                            (e.target as HTMLElement).style.backgroundColor = 'transparent';
                            (e.target as HTMLElement).style.color = '#fca5a5';
                        }}
                    >
                        <svg style={{width: '20px', height: '20px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Logout</span>
                    </button>
                </nav>
            </div>

            <div style={{flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f3f4f6'}}>
                <div style={{height: '64px', backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 24px'}}>
                    <div style={{color: '#374151'}}>
                        Welcome back, {user?.name || 'User'}
                    </div>
                </div>
                
                <div style={{flex: 1, padding: '32px'}}>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;