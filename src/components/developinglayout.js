import { Link, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen flex relative overflow-hidden bg-blue-400   ">

      
      {/* CENTER GLOW BACKGROUND */}
<div
  className="absolute inset-0 pointer-events-none"
  style={{
    background:
      "radial-gradient(circle at center, rgba(234, 239, 245, 0.85), transparent 80%)",
  }}
/>



      {/* APP CONTENT */}
      <div className="relative z-10 flex w-full">
        
        {/* LEFT SIDEBAR */}
        <aside className="w-72 bg-white/90 backdrop-blur border-r border-blue-100 flex flex-col">
          <div className="p-6 text-2xl font-bold neon-pulse-purple text-blue-500">
            GlucoChat
          </div>

          <input
            placeholder="Search chats"
            className="mx-4 mb-4 px-4 py-2 rounded-full bg-blue-50 outline-none"
          />

          <nav className="flex flex-col gap-2 px-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-blue-50 hover:bg-blue-100 cursor-pointer"
              >
                Gluco Friend
              </div>
            ))}
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col">
          
          {/* TOP NAV */}
          <header className="bg-white/90 backdrop-blur border-b border-blue-100 px-10 py-4 flex gap-8">
            <Link to="/dashboard" className="font-semibold text-blue-500">Dashboard</Link>
            <Link to="/log" className="font-semibold">Log</Link>
            <Link to="/social" className="font-semibold">Socials</Link>
            <Link to="/shop" className="font-semibold">Shop</Link>
            <Link to="/checkin" className="font-semibold">Check-In</Link>
          </header>

          {/* PAGE CONTENT */}
          <main className="flex-1 p-10">
            <Outlet />
          </main>

        </div>
      </div>
    </div>
  );
}