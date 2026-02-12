import './ErrorMessage.css';

function ErrorMessage({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="error-message">
      <h3>Error</h3>
      <p>{message}</p>
      {onRetry && (
        <button onClick={onRetry}>Try Again</button>
      )}
    </div>
  );
}

export default ErrorMessage;
