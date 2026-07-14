export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              {/* Logo */}
              <div className="w-10 h-10 bg-primary-900 rounded-corporate flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-primary-900">Aptech Group</h1>
                <p className="text-xs text-neutral-500">Visitor Management System</p>
              </div>
            </div>
            <nav className="flex items-center gap-6">
              <a href="/kiosk" className="text-sm font-medium text-neutral-600 hover:text-primary-900 transition-colors">
                Check In
              </a>
              <a href="/dashboard" className="text-sm font-medium text-neutral-600 hover:text-primary-900 transition-colors">
                Dashboard
              </a>
              <a href="/host" className="text-sm font-medium text-neutral-600 hover:text-primary-900 transition-colors">
                Host View
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-900 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-bold mb-4">
              Welcome to Aptech Group
            </h2>
            <p className="text-xl text-primary-200 mb-8">
              Streamlined visitor management for our offices and factory environments. 
              Secure, efficient, and professional.
            </p>
            <div className="flex gap-4">
              <a
                href="/kiosk"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary-900 font-semibold rounded-corporate hover:bg-neutral-100 transition-colors"
              >
                Start Check-In
              </a>
              <a
                href="/dashboard"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary-700 text-white font-semibold rounded-corporate border border-primary-600 hover:bg-primary-600 transition-colors"
              >
                View Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold text-primary-900 mb-2">How It Works</h3>
          <p className="text-neutral-500">Simple, secure, and efficient visitor management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="card-corporate p-6 text-center">
            <div className="w-14 h-14 bg-accent-100 rounded-corporate-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-primary-900 mb-2">Quick Check-In</h4>
            <p className="text-neutral-500 text-sm">
              Visitors can check in using our self-service kiosk in under 30 seconds.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="card-corporate p-6 text-center">
            <div className="w-14 h-14 bg-success-100 rounded-corporate-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-primary-900 mb-2">Instant Notifications</h4>
            <p className="text-neutral-500 text-sm">
              Hosts receive immediate email and SMS alerts when their visitors arrive.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="card-corporate p-6 text-center">
            <div className="w-14 h-14 bg-warning-100 rounded-corporate-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-primary-900 mb-2">Secure & Compliant</h4>
            <p className="text-neutral-500 text-sm">
              Built-in safety checklists, NDA signing, and emergency evacuation support.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-700 rounded-corporate flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-semibold">Aptech Group</span>
            </div>
            <p className="text-primary-300 text-sm">
              © 2026 Aptech Group. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
