import './LoadingSpinner.css';

function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="loading-spinner">
      <div className="spinner" />
      <p className="loading-text">{message}</p>
    </div>
  );
}

export default LoadingSpinner;
