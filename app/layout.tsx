export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <style>{`body{margin:0;background:#08080a;color:white;font-family:system-ui} *{box-sizing:border-box}`}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
