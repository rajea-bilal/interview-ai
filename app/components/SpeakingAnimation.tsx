"use client";
import { motion } from "framer-motion";

const SpeakingAnimation = () => {
  return (
    <div className="flex gap-1 justify-center items-center h-6">
      {[0.5, 0.8, 1.2].map((scale, index) => (
        <motion.span
          key={index}
          className="w-2 h-2 rounded-full bg-orange-500/50"
          animate={{
            scale: [1, scale, 1],  // Scale up and down
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,  // Infinite loop
            delay: index * 0.2,  // Staggered start
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default SpeakingAnimation;
