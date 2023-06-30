"use client"
import { Inter } from 'next/font/google';
import { MiniDrawer } from "./components/MiniDrawer";

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <>
      <MiniDrawer/>
    </>
  )
}
