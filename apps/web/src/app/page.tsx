export default function Home() {
  return (
    <div className="min-h-screen bg-page">
      <header className="bg-surface border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand text-white flex items-center justify-center rounded-lg font-bold text-lg">V</div>
              <div>
                <h1 className="font-bold text-heading">VMS</h1>
                <p className="text-xs text-muted">Visitor Management</p>
              </div>
            </div>
            <nav className="flex items-center gap-6">
              <a href="/kiosk" className="text-sm font-medium text-muted hover:text-brand transition-colors">Check In</a>
              <a href="/dashboard" className="btn btn-primary btn-sm">Dashboard</a>
              <a href="/host" className="text-sm font-medium text-muted hover:text-brand transition-colors">Host View</a>
            </nav>
          </div>
        </div>
      </header>

      <div className="bg-hero-gradient text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold mb-4">Visitor Management System</h1>
            <p className="text-xl opacity-90 mb-8">Streamlined visitor management for offices and factories. Secure, efficient, and professional.</p>
            <div className="flex gap-4">
              <a href="/kiosk" className="btn bg-white text-brand hover:bg-neutral-100">Start Check-In</a>
              <a href="/dashboard" className="btn border-2 border-white bg-transparent text-white hover:bg-white/10">View Dashboard</a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-heading mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card p-6 text-center">
            <div className="w-16 h-16 bg-brand/10 text-brand flex items-center justify-center mx-auto mb-4 rounded-full">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            </div>
            <h3 className="text-lg font-bold text-heading mb-2">Quick Check-In</h3>
            <p className="text-muted">Visitors can check in using our kiosk in under 30 seconds.</p>
          </div>
          <div className="card p-6 text-center">
            <div className="w-16 h-16 bg-accent/10 text-accent flex items-center justify-center mx-auto mb-4 rounded-full">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </div>
            <h3 className="text-lg font-bold text-heading mb-2">Instant Notifications</h3>
            <p className="text-muted">Hosts receive immediate alerts when visitors arrive.</p>
          </div>
          <div className="card p-6 text-center">
            <div className="w-16 h-16 bg-success/10 text-success flex items-center justify-center mx-auto mb-4 rounded-full">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-heading mb-2">Secure & Compliant</h3>
            <p className="text-muted">Built-in safety checklists and emergency support.</p>
          </div>
        </div>
      </div>

      <footer className="bg-surface border-t border-neutral-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-12 h-12 bg-brand text-white flex items-center justify-center mx-auto mb-4 rounded-lg font-bold text-xl">V</div>
          <p className="font-bold text-heading">VMS - Visitor Management System</p>
        </div>
      </footer>
    </div>
  );
}
