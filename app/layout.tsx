import Image from "next/image";
import { Poppins } from "next/font/google";
import "./globals.css";
import css from "@/assets/css/scrollbar.module.css";
import "react-toastify/dist/ReactToastify.min.css";
import BackgroundFastMu from "@/assets/img/bg-fastabiq.png";
import Toast from "@/components/toast";
import { cn } from "@/lib/utils";
import Provider from "@/context/provider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500"],
  // display: "auto",
});

export const metadata = {
  title: "SIMRS FASTMU",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={poppins.className}>
        <Toast className={poppins.className} />
        <Provider>
          <div className="relative min-h-screen w-full overflow-hidden text-center">
            <Image
              fill
              src={BackgroundFastMu}
              alt="Background Fastabiq"
              className="absolute -z-10 bg-gradient-to-t from-sky-800 to-sky-400 object-cover object-center"
              priority
              quality={100}
            />
            <div className={cn("h-screen w-full overflow-auto", css.scrollbar)}>
              {children}
            </div>
          </div>
        </Provider>
      </body>
    </html>
  );
}
