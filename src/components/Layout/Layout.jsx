import Navbar from './Navbar'

export default function Layout({ children, fullHeight = false }) {
  return (
    <div className={`flex flex-col ${fullHeight ? 'h-screen' : 'min-h-screen'} bg-white`}>
      <Navbar />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
