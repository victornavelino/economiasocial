import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold">
            Emprendedores
          </Link>
          <div className="flex space-x-4">
            <Link href="/emprendedores" className="hover:bg-blue-700 px-3 py-2 rounded">
              Emprendedores
            </Link>
            <Link href="/emprendimientos" className="hover:bg-blue-700 px-3 py-2 rounded">
              Emprendimientos
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}