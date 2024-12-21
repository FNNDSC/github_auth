import React, { useEffect, useState } from "react";

interface AuthResponse {
  access_token?: string;
  error?: string;
}

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (code) {
      setLoading(true);
      exchangeCodeForToken(code);
    }
  }, []);

  const exchangeCodeForToken = async (code: string) => {
    try {
      const response = await fetch("http://localhost:3001/api/github/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const data: AuthResponse = await response.json();

      if (data.access_token) {
        setToken(data.access_token);
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
      } else {
        setError(data.error || "Failed to get access token");
      }
    } catch (err) {
      setError("Failed to exchange code for token");
      console.error("Token exchange error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo`;
  };

  const copyToClipboard = async () => {
    if (token) {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            GitHub Token Generator
          </h1>

          {!token && !loading && (
            <p className="text-gray-600 mb-8">
              Generate a GitHub access token for your application by
              authenticating with your GitHub account.
            </p>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Authenticating with GitHub...</p>
          </div>
        ) : !token ? (
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 mr-2 fill-current"
              aria-hidden="true"
            >
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            Login with GitHub
          </button>
        ) : (
          <div className="space-y-4">
            <p className="text-green-600 font-medium text-center mb-4">
              ✓ Successfully generated token
            </p>
            <div className="relative">
              <textarea
                readOnly
                value={token}
                className="w-full h-24 p-3 text-sm font-mono bg-gray-50 border border-gray-200 rounded-md focus:outline-none"
              />
              <button
                onClick={copyToClipboard}
                className="absolute top-2 right-2 px-3 py-1 text-sm bg-white border border-gray-200 rounded-md hover:bg-gray-50"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="text-sm text-gray-600">
              <p className="mb-2">🔒 Make sure to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Save this token securely - it won't be shown again</li>
                <li>Keep it private and don't share it</li>
                <li>Use it in your application's environment variables</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
