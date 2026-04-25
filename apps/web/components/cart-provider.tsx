'use client'

// CartProvider exists to ensure Zustand's persist middleware hydrates
// on the client before any component reads from the cart.
// Without this, SSR & client will mismatch on the cart item count in the navbar.

import { useEffect, useState } from 'react'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  // Render children immediately — just suppress hydration flash for cart badge
  return <>{children}</>
}
