// src/app/page.tsx

import Landing from "./pages/Landing";

// 1. Must be a function
// 2. Must be exported as DEFAULT
export default function Page() {
  return (
    <main>
      <Landing />
    </main>
  );
}