import { motion } from "framer-motion";

function WeatherEffects({ condition }) {
  if (!condition) return null;

  const weather = condition.toLowerCase();

  if (weather === "clear") {
    return (
      <>
        <motion.div
          className="fixed top-16 right-16 w-56 h-56 rounded-full bg-yellow-300/40 blur-3xl pointer-events-none"
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            repeat: Infinity,
            duration: 6,
          }}
        />

        <motion.div
          className="fixed top-20 right-20 w-40 h-40 rounded-full bg-orange-200/30 blur-2xl pointer-events-none"
          animate={{
            scale: [1.1, 1.3, 1.1],
          }}
          transition={{
            repeat: Infinity,
            duration: 4,
          }}
        />
      </>
    );
  }

  if (weather === "clouds") {
    return (
      <>
        <motion.div
          className="fixed top-20 left-0 w-72 h-24 bg-white/20 rounded-full blur-xl pointer-events-none"
          animate={{ x: [-100, 300, -100] }}
          transition={{
            repeat: Infinity,
            duration: 30,
          }}
        />

        <motion.div
          className="fixed top-40 right-0 w-80 h-28 bg-white/10 rounded-full blur-xl pointer-events-none"
          animate={{ x: [100, -300, 100] }}
          transition={{
            repeat: Infinity,
            duration: 35,
          }}
        />

        <motion.div
          className="fixed top-64 left-1/3 w-64 h-20 bg-white/10 rounded-full blur-xl pointer-events-none"
          animate={{ x: [-150, 150, -150] }}
          transition={{
            repeat: Infinity,
            duration: 25,
          }}
        />
      </>
    );
  }

  if (weather === "rain" || weather === "drizzle") {
    return (
      <>
        {[...Array(120)].map((_, i) => (
          <motion.div
            key={i}
            className="fixed w-[2px] h-10 bg-blue-200/50 pointer-events-none"
            style={{
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: ["-10vh", "110vh"],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.2,
              delay: Math.random() * 2,
              ease: "linear",
            }}
          />
        ))}
      </>
    );
  }

  if (weather === "thunderstorm") {
    return (
      <>
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={i}
            className="fixed w-[2px] h-10 bg-blue-200/50 pointer-events-none"
            style={{
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: ["-10vh", "110vh"],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.1,
              delay: Math.random() * 2,
              ease: "linear",
            }}
          />
        ))}

        <motion.div
          className="fixed inset-0 bg-white pointer-events-none"
          animate={{
            opacity: [0, 0, 0.4, 0, 0, 0.25, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 5,
          }}
        />
      </>
    );
  }

  if (weather === "snow") {
    return (
      <>
        {[...Array(60)].map((_, i) => (
          <motion.div
            key={i}
            className="fixed w-2 h-2 rounded-full bg-white/70 pointer-events-none"
            style={{
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: ["-10vh", "110vh"],
              x: [0, 20, -20, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 8,
              delay: Math.random() * 5,
              ease: "linear",
            }}
          />
        ))}
      </>
    );
  }

  return (
    <>
      {[...Array(80)].map((_, i) => (
        <motion.div
          key={i}
          className="fixed w-1 h-1 rounded-full bg-white/70 pointer-events-none"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
          }}
          transition={{
            repeat: Infinity,
            duration: 2 + Math.random() * 3,
          }}
        />
      ))}
    </>
  );
}

export default WeatherEffects;