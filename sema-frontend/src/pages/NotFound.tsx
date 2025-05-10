import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="py-16 flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-4xl font-bold text-brand-black mb-4">404</h1>
      <p className="text-xl text-ui-gray-600 mb-8">Page not found</p>
      <Link 
        to="/"
        className="px-6 py-2 bg-brand-teal-500 text-white rounded-md hover:bg-brand-teal-600 transition-colors"
      >
        Go back home
      </Link>
    </div>
  )
}

export default NotFound 