import { motion } from "motion/react"

export default function GridBackground() {
  return (
    <div className="absolute inset-0 -z-10 h-full w-full overflow-hidden bg-white">
      {/* Base subtle grid */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(to right, #80808012 1px, transparent 1px), linear-gradient(to bottom, #80808012 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Animated gradient blobs */}
      <motion.div
        animate={{
          x: [0, 60, -40, 0],
          y: [0, -50, 30, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-20 left-1/4 h-[450px] w-[450px] rounded-full bg-orange-400 opacity-30 blur-[110px]"
      />

      <motion.div
        animate={{
          x: [0, -70, 40, 0],
          y: [0, 40, -30, 0],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-40 right-1/4 h-[400px] w-[400px] rounded-full bg-amber-300 opacity-25 blur-[110px]"
      />

      <motion.div
        animate={{
          x: [0, 40, -60, 0],
          y: [0, -30, 50, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 right-10 h-[350px] w-[350px] rounded-full bg-rose-300 opacity-20 blur-[100px]"
      />

      {/* Fade to white at the bottom so content stays readable */}
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-white to-transparent" />
    </div>
  )
}