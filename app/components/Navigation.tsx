'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';


export default function Navigation() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav id="navbar" className="navbar" itemScope itemType="https://schema.org/SiteNavigationElement">
      <div className="container">
        <div className="navbar-brand">
          <Link className="navbar-item has-text-weight-normal" itemProp="url" href="/#home">
            <h1 className="title is-5 has-text-weight-normal">BEAM Community</h1>
          </Link>
          <a className="navbar-item" href="https://github.com/beam-community" target="_blank" rel="noopener noreferrer">
            <span className="icon has-text-grey">
              {mounted && <i className="fab fa-lg fa-github"></i>}
            </span>
          </a>
        </div>
      </div>
    </nav>
  );
} 