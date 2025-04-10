import { Inter } from "next/font/google";
import "../styles/globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

function MyApp({ Component, pageProps }) {
    return (
        <main className={inter.className}>
            <Component {...pageProps} />
            <Toaster />
        </main>
    );
}

export default MyApp;
