import type { Metadata } from 'next';
import './globals.css';
import { Source_Sans_3 } from 'next/font/google';
import Script from 'next/script';

const sourceSans = Source_Sans_3({ 
  subsets: ['latin'],
  weight: ['300', '400'],
  display: 'swap',
  variable: '--font-source-sans',
});

export const metadata: Metadata = {
  title: 'BEAM Community',
  description: 'BEAM Community is a collection of open source projects for the Elixir and Erlang ecosystem.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={sourceSans.variable}>
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css" />
      </head>
      <body>
        {children}
        
        {/* Load Font Awesome with next/script to avoid hydration errors */}
        <Script 
          src="https://use.fontawesome.com/releases/v5.3.1/js/all.js" 
          strategy="afterInteractive"
        />
        
        <Script id="navbar-script" strategy="afterInteractive">
          {`
            document.addEventListener('DOMContentLoaded', function () {
              // Get all "navbar-burger" elements
              var $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
            
              // Check if there are any navbar burgers
              if ($navbarBurgers.length > 0) {
                // Add a click event on each of them
                $navbarBurgers.forEach(function ($el) {
                  $el.addEventListener('click', function () {
                    // Get the target from the "data-target" attribute
                    var target = $el.dataset.target;
                    var $target = document.getElementById(target);
            
                    // Toggle the class on both the "navbar-burger" and the "navbar-menu"
                    $el.classList.toggle('is-active');
                    $target.classList.toggle('is-active');
                  });
                });
              }
            });
          `}
        </Script>
      </body>
    </html>
  );
}
