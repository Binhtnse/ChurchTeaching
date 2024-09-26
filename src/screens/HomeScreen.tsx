import React, {useEffect} from 'react';
import usePageTitle from "../hooks/usePageTitle";

const HomeScreen: React.FC = () => {
    const { setPageTitle } = usePageTitle();

    useEffect(() => {
        setPageTitle('Trang chủ', '#4154f1');
      }, [setPageTitle]);
    

    return (
        <div>
            <div style={{ marginLeft: '256px', padding: '20px' }}>
                <h1>Welcome to the Home Screen</h1>
                <p>This is the main content area.</p>
            </div>
        </div>
    );
}

export default HomeScreen;