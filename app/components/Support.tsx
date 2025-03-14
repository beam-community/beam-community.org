// Mark this component as a client component
'use client';

import { useEffect, useState } from 'react';

import { support } from '../data/core';

export default function Support() {
  // Use state to control when icons are rendered
  const [mounted, setMounted] = useState(false);

  // Only show the icon after component mounts on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="section boxes support" id="support">
      <div className="container">
        <h2 className="title is-5 has-text-centered-touch has-text-black has-text-weight-normal">We Support</h2>
        <div className="columns is-multiline">
          {support.map((project, index) => (
            <div className="column is-3" key={index}>
              <div className="box content is-centered">
                <h4 className="title is-5">
                  <a href={`https://github.com/${project.repo}`} target="_blank" rel="noopener noreferrer">
                    {project.name}
                  </a>
                </h4>
                <p>{project.intro}</p>
              </div>
            </div>
          ))}
          <div className="column is-3 has-text-centered not-box">
            <div>
              <span className="icon is-medium">
                {mounted && (
                  <span className="fa-stack">
                    <i className="fas has-text-grey fa-circle fa-stack-2x"></i>
                    <i className="fas fa-plug fa-stack-1x fa-inverse"></i>
                  </span>
                )}
              </span>
            </div>
            <h3 className="title is-4">Need a plug?</h3>
            <p className="content has-text-weight-light">Contact us to join the family.</p>
          </div>
        </div>
      </div>
    </section>
  );
} 