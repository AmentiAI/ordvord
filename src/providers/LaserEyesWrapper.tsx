"use client";

import { LaserEyesProvider, MAINNET } from "@omnisat/lasereyes";

export default function LaserEyesWrapper({ children }: { children: React.ReactNode }) {
  return (
    <LaserEyesProvider config={{ network: MAINNET }}>
      {children}
    </LaserEyesProvider>
  );
}
