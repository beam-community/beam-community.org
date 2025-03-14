import { metadata } from '../layout';

import Navigation from './Navigation';


export default function Hero() {
  return (
    <section className="hero is-medium hero-home is-black" id="home">
      <div className="hero-head">
        <Navigation />
      </div>
      <div className="hero-body">
        <div className="container">
          <div className="columns is-gapless">
            <div className="column is-5-desktop">
              <h1 className="title is-2 is-uppercase">Discover. Learn. Code.</h1>
              <p className="content is-size-5 has-text-weight-light">
                {metadata.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 