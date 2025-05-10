import { Outlet } from 'react-router-dom'
import Header from '../navigation/Header'
import Footer from '../navigation/Footer'

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-brand-white">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout 