import { Link } from 'react-router-dom';
import './NotFound.css';

function NotFound() {
  return (
    <div>
      <div className="not-found">
        <h1>404</h1>
        <p>Oops! The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link to="/">Volver al inicio</Link>
      </div>
    </div>
  );
}

export default NotFound;
