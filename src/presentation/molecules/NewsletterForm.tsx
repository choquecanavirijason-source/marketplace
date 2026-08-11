"use client";

import { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  if (subscribed) {
    return (
      <div className="inline-flex items-center gap-2 bg-white/20 text-white font-semibold px-6 py-3 rounded-xl">
        ✓ You&apos;re subscribed! Check your inbox.
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 max-w-sm mx-auto">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email address"
        className="flex-1 w-full sm:w-auto bg-white/10 border border-white/20 text-white placeholder:text-white/50 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white/20 transition-colors"
      />
      <button
        type="button"
        onClick={() => email && setSubscribed(true)}
        className="w-full sm:w-auto bg-white text-primary font-bold px-6 py-3 rounded-xl hover:bg-green-50 transition-colors whitespace-nowrap"
      >
        Subscribe
      </button>
    </div>
  );
}
