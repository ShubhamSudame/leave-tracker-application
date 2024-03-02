'use client';
import Topbar from "@/components/Topbar";
import { PrimeReactProvider } from "primereact/api";
import Tailwind from 'primereact/passthrough/tailwind';

export default function Home() {
  return (
    <PrimeReactProvider value={{ unstyled: true, pt: Tailwind }}>
      <Topbar />
    </PrimeReactProvider>
    
  );
}
