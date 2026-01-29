import { useTradingContext } from '../context/TradingContext';
import './Notification.css';

const Notification = () => {
    const { notification } = useTradingContext();

    if (!notification) return null;

    return (
        <div className={`notification ${notification.type}`}>
            {notification.message}
        </div>
    );
};

export default Notification;
