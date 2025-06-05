import React from 'react';
import logger from '../utils/logger';

const Widget = ({ children }: { children: React.ReactNode }) => {
    const handleClick = () => {
        logger.info('Widget clicked');
        // Do something
    };

    return <button onClick={handleClick}>{children}</button>;
};

export default Widget;