import { Link } from 'react-router-dom'
import { FaGithub } from 'react-icons/fa'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-white border-t border-ui-gray-200 py-6">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Brand */}
          <div className="mb-4 md:mb-0">
            <Link to="/" className="inline-block">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Sema" className="h-8" />
                <span className="text-xl font-bold text-brand-black">Sema</span>
              </div>
            </Link>
          </div>
          
          {/* GitHub */}
          <div className="mb-4 md:mb-0">
            <a 
              href="https://github.com/lewiskimaru/sema" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-ui-gray-600 hover:text-brand-green-500 transition-colors flex items-center"
              aria-label="GitHub"
            >
              <FaGithub className="h-5 w-5 mr-2" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-6 pt-6 border-t border-ui-gray-200 flex flex-col md:flex-row items-center justify-between text-sm text-ui-gray-500">
          <p>
            &copy; {currentYear} Sema Translator
          </p>
          <p className="mt-2 md:mt-0">
            A project by <a 
              href="http://atomio.tech" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-brand-green-500 hover:text-brand-green-600 transition-colors"
            >
              Atomio
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer 