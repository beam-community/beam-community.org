import Fact from './components/Fact';
import Hero from './components/Hero';
import Projects from './components/Projects';
import Support from './components/Support';

export default function Home() {
  return (
    <main>
      <Hero />
      <Fact />
      <Projects />
      <Support />
    </main>
  );
}
