import { Link } from 'react-router-dom'
import { FaGithub, FaTwitter } from 'react-icons/fa'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-white border-t border-ui-gray-200 py-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="inline-block">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Sema Translator" className="h-8" />
                <h2 className="flex items-center space-x-1">
                  <span className="text-xl font-bold text-brand-black">Sema</span>
                  <span className="text-brand-teal-500 font-medium">Translator</span>
                </h2>
              </div>
            </Link>
            <p className="mt-3 text-sm text-ui-gray-600">
              Breaking language barriers with modern AI translation technology.
            </p>
            <div className="mt-4 flex space-x-4">
              <a 
                href="https://github.com/lewiskimaru/sema" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-ui-gray-600 hover:text-brand-teal-500 transition-colors"
                aria-label="GitHub"
              >
                <FaGithub className="h-5 w-5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-ui-gray-600 hover:text-brand-teal-500 transition-colors"
                aria-label="Twitter"
              >
                <FaTwitter className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Features */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-brand-black uppercase tracking-wider mb-4">
              Features
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/translate" 
                  className="text-ui-gray-600 hover:text-brand-teal-500 transition-colors text-sm"
                >
                  Text Translation
                </Link>
              </li>
              <li>
                <Link 
                  to="/languages" 
                  className="text-ui-gray-600 hover:text-brand-teal-500 transition-colors text-sm"
                >
                  Supported Languages
                </Link>
              </li>
              <li>
                <Link 
                  to="/chat" 
                  className="text-ui-gray-600 hover:text-brand-teal-500 transition-colors text-sm"
                >
                  Multilingual Chat
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Resources */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-brand-black uppercase tracking-wider mb-4">
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="https://docs.sematranslate.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-ui-gray-600 hover:text-brand-teal-500 transition-colors text-sm"
                >
                  API Documentation
                </a>
              </li>
              <li>
                <a 
                  href="https://sematranslate.com/blog" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-ui-gray-600 hover:text-brand-teal-500 transition-colors text-sm"
                >
                  Blog
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/lewiskimaru/sema" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-ui-gray-600 hover:text-brand-teal-500 transition-colors text-sm"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
          
          {/* Company */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-brand-black uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="/about" 
                  className="text-ui-gray-600 hover:text-brand-teal-500 transition-colors text-sm"
                >
                  About Us
                </a>
              </li>
              <li>
                <a 
                  href="/privacy" 
                  className="text-ui-gray-600 hover:text-brand-teal-500 transition-colors text-sm"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a 
                  href="/terms" 
                  className="text-ui-gray-600 hover:text-brand-teal-500 transition-colors text-sm"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-ui-gray-200">
          <p className="text-sm text-ui-gray-500 text-center">
            &copy; {currentYear} Sema Translator. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer 