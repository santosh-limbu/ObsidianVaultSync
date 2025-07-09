import { useEffect } from 'react';

export default function AuthCallback() {
  useEffect(() => {
    // Extract the authorization code from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      // Send error to parent window
      window.opener?.postMessage({
        type: 'GOOGLE_AUTH_ERROR',
        error: error,
      }, window.location.origin);
      window.close();
      return;
    }

    if (code) {
      // Send success code to parent window
      window.opener?.postMessage({
        type: 'GOOGLE_AUTH_SUCCESS',
        code: code,
      }, window.location.origin);
      window.close();
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center obsidian-bg">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full obsidian-bg flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-obsidian-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-lg font-semibold text-obsidian-text mb-2">
          Completing authentication...
        </h2>
        <p className="text-gray-400 text-sm">
          This window will close automatically.
        </p>
      </div>
    </div>
  );
}