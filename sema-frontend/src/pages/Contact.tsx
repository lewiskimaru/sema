import { useState } from 'react'
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaQuestionCircle, FaPaperPlane, FaCheck } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'

// FAQ item type
interface FAQItem {
  question: string
  answer: string
}

const Contact = () => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  
  // FAQ state
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null)
  
  // FAQ data
  const faqs: FAQItem[] = [
    {
      question: 'What languages does Sema Translator support?',
      answer: 'Sema Translator supports over 200 languages from all regions of the world, including many low-resource and indigenous languages. You can find the complete list on our Languages page.'
    },
    {
      question: 'Is Sema Translator free to use?',
      answer: 'Yes, Sema Translator offers a free tier that allows you to translate text with basic features. We also offer premium plans for users who need advanced features, higher character limits, and API access.'
    },
    {
      question: 'How accurate are the translations?',
      answer: 'Sema uses state-of-the-art neural machine translation technology, which provides high-quality translations for most language pairs. The accuracy varies by language pair, with more commonly spoken languages typically having better results than rare languages.'
    },
    {
      question: 'Can I use Sema for commercial purposes?',
      answer: 'Yes, Sema Translator can be used for commercial purposes. However, for high-volume commercial use, we recommend our Business or Enterprise plans which offer dedicated support and higher usage limits.'
    },
    {
      question: 'How do I report an incorrect translation?',
      answer: 'You can report incorrect translations directly from the translation interface by clicking the "Report issue" link below the translation. Your feedback helps us improve our translation quality.'
    },
    {
      question: 'Is my data secure when using Sema Translator?',
      answer: 'Yes, we take data security very seriously. We do not store your translations permanently unless you explicitly save them to your account. All data transmission is encrypted using HTTPS, and we comply with GDPR and other privacy regulations.'
    }
  ]
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }
  
  // Validate form
  const validateForm = () => {
    let valid = true
    const newErrors = { ...formErrors }
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
      valid = false
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
      valid = false
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
      valid = false
    }
    
    // Subject validation
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required'
      valid = false
    }
    
    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
      valid = false
    } else if (formData.message.length < 20) {
      newErrors.message = 'Message should be at least 20 characters'
      valid = false
    }
    
    setFormErrors(newErrors)
    return valid
  }
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }
    
    setSubmitting(true)
    
    try {
      // In a real app, this would send the data to an API
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setSubmitted(true)
      toast.success('Your message has been sent successfully!')
      
      // Reset form after success
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      })
      
      // After 5 seconds, allow submitting another message
      setTimeout(() => {
        setSubmitted(false)
      }, 5000)
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message. Please try again later.')
    } finally {
      setSubmitting(false)
    }
  }
  
  // Toggle FAQ
  const toggleFAQ = (index: number) => {
    setActiveFAQ(activeFAQ === index ? null : index)
  }
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  }
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4
      }
    }
  }
  
  return (
    <div className="py-8 pb-16">
      <div className="container-custom">
        <motion.div 
          className="mb-10 text-center"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.h1 
            className="text-3xl md:text-4xl font-bold text-brand-black mb-4"
            variants={itemVariants}
          >
            Contact Us
          </motion.h1>
          <motion.p 
            className="text-lg text-ui-gray-700 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            Have questions or feedback? We'd love to hear from you. Our team is always here to help.
          </motion.p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-smooth p-6">
              <h2 className="text-xl font-bold text-brand-black mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 bg-brand-teal-100 rounded-full flex items-center justify-center">
                    <FaEnvelope className="text-brand-teal-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-brand-black">Email</h3>
                    <p className="mt-1 text-ui-gray-700">support@sematranslator.com</p>
                    <p className="mt-1 text-sm text-ui-gray-500">We'll respond within 24 hours</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 bg-brand-teal-100 rounded-full flex items-center justify-center">
                    <FaPhoneAlt className="text-brand-teal-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-brand-black">Phone</h3>
                    <p className="mt-1 text-ui-gray-700">+1 (555) 123-4567</p>
                    <p className="mt-1 text-sm text-ui-gray-500">Mon-Fri from 9AM to 5PM EST</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 bg-brand-teal-100 rounded-full flex items-center justify-center">
                    <FaMapMarkerAlt className="text-brand-teal-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-brand-black">Office</h3>
                    <p className="mt-1 text-ui-gray-700">123 Translation Ave, Suite 101</p>
                    <p className="text-ui-gray-700">San Francisco, CA 94107</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 bg-brand-teal-100 rounded-full flex items-center justify-center">
                    <FaQuestionCircle className="text-brand-teal-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-brand-black">Help Center</h3>
                    <p className="mt-1 text-ui-gray-700">Visit our <a href="#" className="text-brand-teal-600 hover:text-brand-teal-700">Help Center</a> for quick answers to common questions</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-brand-teal-50 rounded-lg border border-brand-teal-100">
                <h3 className="font-medium text-brand-teal-900">Business Inquiries</h3>
                <p className="mt-1 text-sm text-ui-gray-700">For business partnerships or enterprise plans, please email us at:</p>
                <p className="mt-1 font-medium text-brand-teal-700">business@sematranslator.com</p>
              </div>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-smooth p-6">
              <h2 className="text-xl font-bold text-brand-black mb-6">Send Us a Message</h2>
              
              {submitted ? (
                <div className="text-center py-12">
                  <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <FaCheck className="text-green-600 text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold text-brand-black mb-2">Thank You!</h3>
                  <p className="text-ui-gray-700">Your message has been sent successfully. We'll get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-ui-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-teal-400 focus:border-transparent ${
                          formErrors.name ? 'border-ui-red-300' : 'border-ui-gray-300'
                        }`}
                        placeholder="Your name"
                      />
                      {formErrors.name && (
                        <p className="mt-1 text-sm text-ui-red-600">{formErrors.name}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-ui-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-teal-400 focus:border-transparent ${
                          formErrors.email ? 'border-ui-red-300' : 'border-ui-gray-300'
                        }`}
                        placeholder="your.email@example.com"
                      />
                      {formErrors.email && (
                        <p className="mt-1 text-sm text-ui-red-600">{formErrors.email}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="subject" className="block text-sm font-medium text-ui-gray-700 mb-1">Subject</label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-teal-400 focus:border-transparent ${
                        formErrors.subject ? 'border-ui-red-300' : 'border-ui-gray-300'
                      }`}
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="feedback">Feedback</option>
                      <option value="translation">Translation Issue</option>
                      <option value="billing">Billing Question</option>
                      <option value="partnership">Partnership Opportunity</option>
                      <option value="other">Other</option>
                    </select>
                    {formErrors.subject && (
                      <p className="mt-1 text-sm text-ui-red-600">{formErrors.subject}</p>
                    )}
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="message" className="block text-sm font-medium text-ui-gray-700 mb-1">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={6}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-teal-400 focus:border-transparent ${
                        formErrors.message ? 'border-ui-red-300' : 'border-ui-gray-300'
                      }`}
                      placeholder="Please describe your question or issue in detail..."
                    />
                    {formErrors.message && (
                      <p className="mt-1 text-sm text-ui-red-600">{formErrors.message}</p>
                    )}
                    <p className="mt-1 text-sm text-ui-gray-500">
                      {formData.message.length}/500 characters (minimum 20)
                    </p>
                  </div>
                  
                  <div>
                    <button
                      type="submit"
                      className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>Sending...</>
                      ) : (
                        <>
                          <FaPaperPlane /> Send Message
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
        
        {/* FAQs Section */}
        <div className="bg-white rounded-xl shadow-smooth p-6">
          <h2 className="text-2xl font-bold text-brand-black mb-6">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="border border-ui-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  className="w-full text-left p-4 flex items-center justify-between bg-white hover:bg-ui-gray-50 transition-colors"
                  onClick={() => toggleFAQ(index)}
                >
                  <span className="font-medium text-brand-black">{faq.question}</span>
                  <span className={`transform transition-transform ${activeFAQ === index ? 'rotate-180' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-ui-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                
                <div 
                  className={`px-4 pb-4 text-ui-gray-700 ${activeFAQ === index ? 'block' : 'hidden'}`}
                >
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-ui-gray-700">
              Didn't find what you were looking for? <a href="#" className="text-brand-teal-600 hover:text-brand-teal-700 font-medium">Visit our Help Center</a> or <a href="#" className="text-brand-teal-600 hover:text-brand-teal-700 font-medium">browse our documentation</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact 