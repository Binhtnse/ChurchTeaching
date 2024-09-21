import React from 'react';
import { useSelector } from 'react-redux';
import Sidebar from "../components/Sidebar";
import { RootState } from '../store';

const HomeScreen: React.FC = () => {
    const { role, isLoggedIn, userName } = useSelector((state: RootState) => state.auth);

    return (
        <div>
            <Sidebar role={role} isLoggedIn={isLoggedIn} />
            <div style={{ marginLeft: '256px', padding: '20px' }}>
                <h1>Welcome to the Home Screen, {userName}</h1>
                <p>This is the main content area.</p>
            </div>
        </div>
    );
}

export default HomeScreen;