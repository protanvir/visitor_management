export default function Home() {
  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="navbar bg-base-100 border-b border-base-300">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">
            <div className="w-10 h-10 bg-primary text-primary-content flex items-center justify-center rounded-lg font-bold">
              V
            </div>
            <span>VMS</span>
          </a>
        </div>
        <div className="flex-none">
          <ul className="menu menu-horizontal px-1">
            <li><a href="/kiosk">Check In</a></li>
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/host">Host View</a></li>
          </ul>
        </div>
      </div>

      {/* Hero */}
      <div className="hero bg-primary text-primary-content py-20">
        <div className="hero-content text-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold">Visitor Management System</h1>
            <p className="py-6 text-lg opacity-90">
              Streamlined visitor management for offices and factories. Secure, efficient, and professional.
            </p>
            <div className="flex gap-4 justify-center">
              <a href="/kiosk" className="btn btn-lg bg-white text-primary hover:bg-white/90">
                Start Check-In
              </a>
              <a href="/dashboard" className="btn btn-lg btn-outline border-white text-white hover:bg-white/10">
                View Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card bg-base-100 border border-base-300 shadow-md">
            <div className="card-body items-center text-center">
              <div className="w-16 h-16 bg-primary/10 text-primary flex items-center justify-center rounded-full mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="card-title">Quick Check-In</h3>
              <p className="text-base-content/60">Visitors can check in using our kiosk in under 30 seconds.</p>
            </div>
          </div>

          <div className="card bg-base-100 border border-base-300 shadow-md">
            <div className="card-body items-center text-center">
              <div className="w-16 h-16 bg-secondary/10 text-secondary flex items-center justify-center rounded-full mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="card-title">Instant Notifications</h3>
              <p className="text-base-content/60">Hosts receive immediate alerts when visitors arrive.</p>
            </div>
          </div>

          <div className="card bg-base-100 border border-base-300 shadow-md">
            <div className="card-body items-center text-center">
              <div className="w-16 h-16 bg-success/10 text-success flex items-center justify-center rounded-full mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="card-title">Secure & Compliant</h3>
              <p className="text-base-content/60">Built-in safety checklists and emergency support.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer footer-center bg-base-200 text-base-content p-8">
        <div>
          <div className="w-12 h-12 bg-primary text-primary-content flex items-center justify-center rounded-lg font-bold text-xl mb-2">
            V
          </div>
          <p className="font-bold">VMS - Visitor Management System</p>
        </div>
      </footer>
    </div>
  );
}
