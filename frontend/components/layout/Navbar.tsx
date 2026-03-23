import Link from 'next/link';
 
export default function Navbar() {
  return (
    <nav style={{ backgroundColor: '#1a6fa0' }} className="text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <span style={{ color: '#8dc63f' }}>●</span>
            <span>Emprendedores</span>
          </Link>
          <div className="flex space-x-2">
            <Link
              href="/emprendedores"
              className="px-4 py-2 rounded font-medium transition-colors hover:bg-white/10"
            >
              Emprendedores
            </Link>
            <Link
              href="/emprendimientos"
              className="px-4 py-2 rounded font-medium transition-colors hover:bg-white/10"
            >
              Emprendimientos
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}