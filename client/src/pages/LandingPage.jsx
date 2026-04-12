import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ParallaxHero from "../components/ParallaxHero";

/* ---------- SMOOTH SCROLL WITH CORRECT OFFSET ---------- */
function scrollToId(id) {
  requestAnimationFrame(() => {
    const el = document.getElementById(id);
    if (!el) return;

    const navbarOffset = 90;
    const y =
      el.getBoundingClientRect().top + window.scrollY - navbarOffset;

    window.scrollTo({ top: y, behavior: "smooth" });
  });
}

/* ---------- FIX MOBILE VH ---------- */
function useDynamicVH() {
  useEffect(() => {
    const setVH = () => {
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight * 0.01}px`
      );
    };
    setVH();
    window.addEventListener("resize", setVH);
    return () => window.removeEventListener("resize", setVH);
  }, []);
}

function Section({ id, children }) {
  return (
    <section
      id={id}
      className="relative z-10 min-h-[calc(var(--vh,1vh)*100)] flex items-center justify-center px-6 py-24 bg-transparent"
    >
      <div className="w-full max-w-6xl animate-fadeIn">{children}</div>
    </section>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useDynamicVH();

  /* ---------- REACTIVE AUTH ---------- */
  useEffect(() => {
    const check = () => setIsLoggedIn(!!localStorage.getItem("authToken"));
    check();
    window.addEventListener("storage", check);
    return () => window.removeEventListener("storage", check);
  }, []);

  return (
    <div className="relative text-gray-900 overflow-x-hidden">
      
      {/* BACKGROUND */}
      <div className="fixed inset-0 -z-10">
        <ParallaxHero />
      </div>

      {/* HERO */}
      <section
        id="home"
        className="relative z-10 min-h-[calc(var(--vh,1vh)*100)] flex items-center justify-center text-center text-white px-4 sm:px-6"
      >
        <div className="space-y-4 sm:space-y-6 max-w-4xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight">
            Spawn Into Real-Time Chat
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl opacity-90 font-medium px-2">
            A playful communication space built for instant interaction, social connection, and expressive conversations.
          </p>

          <p className="opacity-80 text-base sm:text-lg leading-relaxed hidden sm:block">
            ChatApp combines private messaging, group communities, and QR instant add — all inside a smooth animated world.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 px-4 sm:px-0">
            <button
              type="button"
              onClick={() => navigate("/rooms")}
              className="cartoon-btn bg-[#7C3AED] text-white hover:bg-[#6D28D9] w-full sm:w-auto"
            >
              Explore Rooms
            </button>
            <button
              type="button"
              onClick={() => navigate("/scan")}
              className="cartoon-btn bg-[#7C3AED] text-white hover:bg-[#6D28D9] w-full sm:w-auto"
            >
              Start Chatting
            </button>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <Section id="problem">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl cartoon-title mb-6">Why This App?</h2>
          <ul className="space-y-4 text-lg opacity-80">
            <li>Large social apps are cluttered and distracting</li>
            <li>Hard to instantly connect people physically nearby</li>
            <li>Academic discussions get lost in noisy platforms</li>
            <li>Username searching is slow and error-prone</li>
            <li>Privacy concerns in open social networks</li>
          </ul>
        </div>
      </Section>

      {/* FEATURES */}
      <Section id="features">
        <div className="text-center">
          <h2 className="text-4xl cartoon-title mb-12">Core Features</h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <Feature title="Private Chat" text="Secure real-time one-to-one messaging." />
            <Feature title="Chat Rooms" text="Topic based communities." />
            <Feature title="QR Connect" text="Instant friend add." />
            <Feature title="Online Status" text="Live presence detection." />
            <Feature title="Real-Time Engine" text="Socket powered instant delivery." />
            <Feature title="Persistent History" text="MongoDB message storage." />
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section id="cta">
        <div className="text-center">
          <h2 className="text-4xl cartoon-title mb-6">Ready to Start?</h2>
          <p className="text-lg opacity-80 mb-8">
            Experience real-time communication built for simplicity.
          </p>

          <button
            type="button"
            onClick={() => navigate(isLoggedIn ? "/" : "/login")}
            className="cartoon-btn bg-[#7C3AED] text-white hover:bg-[#6D28D9]"
          >
            {isLoggedIn ? "Go to Dashboard" : "Create Account"}
          </button>
        </div>
      </Section>

      <footer className="relative z-10 text-center py-12 border-t-4 border-black bg-transparent">
        <p className="text-xl font-semibold">ChatApp</p>
        <p className="opacity-70 mt-2">Real-time communication platform</p>
        <p className="opacity-60 mt-4 text-sm">Built with MERN + Socket.IO</p>
        <p className="opacity-50 mt-6 text-xs">© 2026 Tanmay Patil</p>
      </footer>
    </div>
  );
}

/* ---------- FEATURE CARD ---------- */
function Feature({ title, text }) {
  return (
    <div>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="opacity-80">{text}</p>
    </div>
  );
}