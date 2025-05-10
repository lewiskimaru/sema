import { motion } from 'framer-motion'

const LoadingScreen = () => {
  return (
    <div className="h-full min-h-[300px] w-full flex flex-col items-center justify-center p-6">
      <div className="text-center">
        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Animated logo or loader */}
          <div className="relative">
            <motion.div
              className="w-16 h-16 rounded-full border-4 border-ui-gray-200"
              animate={{ 
                rotate: 360,
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <motion.div
              className="absolute top-0 left-0 w-16 h-16 rounded-full border-t-4 border-brand-teal-400"
              animate={{ 
                rotate: 360,
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </div>
        </motion.div>
        
        <motion.p
          className="text-lg font-medium text-ui-gray-700"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Loading...
        </motion.p>
        
        <motion.p
          className="text-sm text-ui-gray-500 max-w-xs mx-auto mt-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          Preparing your seamless translation experience
        </motion.p>
      </div>
    </div>
  )
}

export default LoadingScreen 