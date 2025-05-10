import { Outlet, Link } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-brand-white">
      {/* Back to home link */}
      <div className="container-custom pt-6">
        <Link to="/" className="inline-flex items-center text-ui-gray-700 hover:text-brand-teal-600 transition-colors">
          <FaArrowLeft className="mr-2" />
          <span>Back to Home</span>
        </Link>
      </div>
      
      {/* Auth container */}
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-xl shadow-smooth w-full max-w-md p-8">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <h1 className="text-2xl font-bold text-brand-black">Sema Translator</h1>
              <p className="text-ui-gray-500 mt-1">Communicate without borders</p>
            </Link>
          </div>
          
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AuthLayout 