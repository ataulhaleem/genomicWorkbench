import Script from 'next/script';
import './globals.css'
// import { SearchAppBar } from "./components/SearchAppBar";
// import { TemporaryDrawer } from "./components/TempDrawer";


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body >
        {children}
      </body>
    </html>
  )
}
