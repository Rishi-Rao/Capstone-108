import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Intro from "./pages/Intro";
import Upload from "./pages/Upload";
import Navbar from "./components/Navbar";
import { loadTheme } from "./styles/theme";

const App = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation(); 

  // Initialize theme on app mount
  useEffect(() => {
    loadTheme();
  }, []);

  const onLoginSuccess = (username) => {
    setAuthenticated(true);
    setUser(username);
    navigate("/intro");
  };

  const onLogout = () => {
    setAuthenticated(false);
    setUser(null);
    navigate("/");
  };

  // Page animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  const pageTransition = { duration: 0.5, ease: "easeInOut" };

  return (
    <div className="min-h-screen font-[Poppins] transition-all duration-300 bg-[var(--background)] text-[var(--text-color)]">
      {authenticated && <Navbar onLogout={onLogout} user={user} />}

      <div className="max-w-6xl mx-auto px-4 py-6 pt-24">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {!authenticated ? (
              <>
                <Route
                  path="/"
                  element={
                    <motion.div
                      className="card card-glass"
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <Login onLoginSuccess={onLoginSuccess} />
                    </motion.div>
                  }
                />
                <Route
                  path="/signup"
                  element={
                    <motion.div
                      className="card card-glass"
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <Signup />
                    </motion.div>
                  }
                />
                <Route path="*" element={<Navigate to="/" />} />
              </>
            ) : (
              <>
                <Route
                  path="/intro"
                  element={
                    <motion.div
                      className="card card-glass"
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <Intro />
                    </motion.div>
                  }
                />
                <Route
                  path="/upload"
                  element={
                    <motion.div
                      className="card card-glass"
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <Upload />
                    </motion.div>
                  }
                />
                <Route path="*" element={<Navigate to="/intro" />} />
              </>
            )}
          </Routes>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default App;
