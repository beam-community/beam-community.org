import { projects } from '../data/core';

export default function Projects() {
  return (
    <section className="section boxes" id="projects">
      <div className="container">
        <h2 className="title is-5 has-text-centered-touch has-text-weight-normal">Featured Projects</h2>
        <div className="columns is-multiline is-touch">
          {projects.map((project, index) => (
            <div className="column is-3" key={index}>
              <div className="box content is-centered">
                <h4 className="title is-5">
                  <a href={`https://github.com/beam-community/${project.repo}`} target="_blank" rel="noopener noreferrer">
                    {project.name}
                  </a>
                </h4>
                <p>{project.intro}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 