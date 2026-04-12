import { useEffect } from "react";

export default function ChatBot() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://www.noupe.com/embed/019c6a31b8e87b22b9d541ec2f642d294418.js";
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
}
