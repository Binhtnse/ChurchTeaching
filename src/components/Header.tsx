import React from 'react';

const Header: React.FC = () => {
  return (
    <div style={{ height: '100px', width: '100%' }}>
      <img 
        src="http://gpbanmethuot.com/Image/Picture/Logo/gpbanmethuot.com.jpg" 
        alt="Church Teaching Header" 
        style={{ width: '100%', height: '100%', objectFit: 'cover', overflowClipMargin: 'content-box',
            overflow: 'clip',
            overflowX: 'clip',
            overflowY: 'clip' }}
      />
    </div>
  );
};

export default Header;
