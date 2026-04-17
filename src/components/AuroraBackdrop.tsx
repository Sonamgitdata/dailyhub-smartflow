import { motion } from "framer-motion";

export function AuroraBackdrop() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute -top-32 -left-32 h-[40rem] w-[40rem] rounded-full"
        style={{
          background:
            "radial-gradient(circle, oklch(0.72 0.18 295 / 0.45), transparent 60%)",
          filter: "blur(60px)",
        }}
        animate={{ x: [0, 60, -30, 0], y: [0, -40, 30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 -right-40 h-[36rem] w-[36rem] rounded-full"
        style={{
          background:
            "radial-gradient(circle, oklch(0.82 0.18 155 / 0.4), transparent 60%)",
          filter: "blur(70px)",
        }}
        animate={{ x: [0, -40, 30, 0], y: [0, 30, -20, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/4 h-[32rem] w-[32rem] rounded-full"
        style={{
          background:
            "radial-gradient(circle, oklch(0.85 0.15 210 / 0.35), transparent 60%)",
          filter: "blur(70px)",
        }}
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
