import logger from '../utils/logger';

const Widget = () => {
    const handleClick = () => {
        logger.info('Widget clicked');
        // Do something
    };

    return <button onClick={handleClick}>Click me</button>;
};

export default Widget