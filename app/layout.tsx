import "./globals.css";

export const metadata = {
  title: "Hallucination Checker",
  description: "Real-time perception confirmation dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white">{children}</body>
    </html>
  );
}
