import { Link } from 'react-router-dom'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-white border-t border-ui-gray-200 py-6">
      <div className="container-custom">
        {/* Copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between text-sm text-ui-gray-500">
          <p>
            &copy; {currentYear} Sema Translator
          </p>
          <p className="mt-2 md:mt-0">
            powered by <a 
              href="http://atomio.tech" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-brand-blue-500 hover:text-brand-blue-600 transition-colors"
            >
              atomio
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer 