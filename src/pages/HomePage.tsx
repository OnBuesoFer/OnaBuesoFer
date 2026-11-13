import { Hero } from '../components/sections/Hero.tsx';
import { WorkIndex } from '../components/work/WorkIndex.tsx';
import { About } from '../components/sections/About.tsx';
import { Bridge } from '../components/sections/Bridge.tsx';
import { Education, Experience, Recognition } from '../components/sections/Journey.tsx';
import { Contact } from '../components/sections/Contact.tsx';
import { Disciplines } from '../components/sections/Disciplines.tsx';

export function HomePage() {
  return (
    <>
      <Hero />
      <WorkIndex />
      <About />
      <Bridge />
      <Disciplines />
      <Experience />
      <Education />
      <Recognition />
      <Contact />
    </>
  );
}
