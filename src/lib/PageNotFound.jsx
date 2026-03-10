import { useLocation } from 'react-router-dom';

export default function PageNotFound() {
    const location = useLocation();
    const pageName = location.pathname.substring(1);

    return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#060606' }}>
            <div className="max-w-md w-full text-center space-y-6">
                <h1 className="font-syne font-bold text-7xl" style={{ color: '#1a1a1a' }}>404</h1>
                <div className="h-px w-16 mx-auto" style={{ background: '#1a1a1a' }} />
                <h2 className="font-syne font-semibold text-xl text-white">Signal Lost</h2>
                <p className="font-mono text-xs" style={{ color: '#555' }}>
                    The page <span className="text-white">"{pageName}"</span> was not found in the NovaVerse.
                </p>
                <button
                    onClick={() => window.location.href = '/'}
                    className="font-mono text-xs px-6 py-2 rounded cursor-pointer transition-opacity hover:opacity-80"
                    style={{ background: '#00ff8818', border: '1px solid #00ff8840', color: '#00ff88' }}
                >
                    ← Return to Dashboard
                </button>
            </div>
        </div>
    );
}