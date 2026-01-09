import "./globals.css";

export const metadata = {
  title: "LuminaVision",
  description: "Real-time perception confirmation dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="
        h-full 
        bg-[#091b45] text-white 
        overflow-x-hidden 
        font-sans antialiased
      ">
        {children}
      </body>
    </html>
  );
}