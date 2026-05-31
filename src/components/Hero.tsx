import { motion } from 'framer-motion'

/** 首页 Hero 区域 */
export default function Hero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24"
    >
      <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
        <span className="gradient-text">图片集</span>
      </h1>
      <p className="max-w-xl text-lg text-[#a3a3a3]">
         
      </p>
    </motion.section>
  )
}
