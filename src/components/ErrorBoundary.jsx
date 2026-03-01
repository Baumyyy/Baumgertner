import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-page">
          <div className="error-boundary-content">
            <span className="error-boundary-icon">&#9888;</span>
            <h2 className="error-boundary-title">Something went wrong</h2>
            <p className="error-boundary-msg">
              An unexpected error occurred. Try refreshing the page.
            </p>
            <button
              className="error-boundary-btn"
              onClick={function() { window.location.reload(); }}
            >
              Refresh page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
