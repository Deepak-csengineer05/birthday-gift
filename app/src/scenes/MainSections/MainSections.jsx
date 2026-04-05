import React, { useState } from 'react';
import './MainSections.css';
import Section1 from '../Section1/Section1';
import Section2 from '../Section2/Section2';
import Section3 from '../Section3/Section3';
import Section4 from '../Section4/Section4';
import Section5 from '../Section5/Section5';
import Section6 from '../Section6/Section6';
import Section7 from '../Section7/Section7';
import Section8 from '../Section8/Section8';
import Section9 from '../Section9/Section9';
import Section10 from '../Section10/Section10';

export default function MainSections({ onProceed, onVideoStart, onSection5Start, initialSection = 1, isHubMode = false }) {
  const [currentSection, setCurrentSection] = useState(initialSection);

  React.useEffect(() => {
    setCurrentSection(initialSection);
  }, [initialSection]);

  const goToNextSection = () => {
    if (isHubMode) {
      // In hub mode, finishing any single section just kicks you back to the hub.
      onProceed?.();
    } else {
      setCurrentSection((prev) => {
        const nextSection = prev + 1;
        if (nextSection > 10) {
          onProceed?.();
        }
        return nextSection;
      });
    }
  };

  React.useEffect(() => {
    if (currentSection === 5 && onSection5Start) {
      onSection5Start();
    }
  }, [currentSection, onSection5Start]);

  return (
    <div className="main-sections-wrapper">
      {currentSection === 1 && <Section1 onNext={goToNextSection} onVideoStart={onVideoStart} />}
      {currentSection === 2 && <Section2 onNext={goToNextSection} />}
      {currentSection === 3 && <Section3 onNext={goToNextSection} />}
      {currentSection === 4 && <Section4 onNext={goToNextSection} />}
      {currentSection === 5 && <Section5 onNext={goToNextSection} />}
      {currentSection === 6 && <Section6 onNext={goToNextSection} />}
      {currentSection === 7 && <Section7 onNext={goToNextSection} />}
      {currentSection === 8 && <Section8 onNext={goToNextSection} />}
      {currentSection === 9 && <Section9 onNext={goToNextSection} />}
      {currentSection === 10 && <Section10 onNext={goToNextSection} />}
    </div>
  );
}
