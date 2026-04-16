import React from 'react';
import './LetterScroll.css';

export default function LetterScroll({ show, onFold }) {
  if (!show) return null;

  return (
    <div className={`s11-letter-overlay ${show ? 'show' : ''}`}>
      <div className="s11-paper-container">
        <div className="s11-letter-content">
          <div className="s11-letter-greeting">Hi Lunar ,</div>
          
          <p>
            Yepdi start panna nu theriyala… seri, first enoda wish ah convey paniduren.Wishing you many more happy returns of the day — Happy Birthday Poojetha! 🎉 Yepavum pola happy ah iru… nee tha best in all ways. Intha year la unaku pidicha maari ellame nadakanum nu wish panren.
          </p>

          <p>
            Ippo naan solla porathu konjam over ah irukum, aana athoda depth enakku dhaan theriyum. Nee enaku friend ah kidaichathuku intha universe ku dhaan thanks sollanum. Unna maari oru pure soul friend ah kidaikkarathu romba easy illa. So I’m always grateful to the universe for bringing such a good soul into my life.
          </p>

          <p>
            Namma matha friends maari yepavum onna suthitu, pesitu irukala naalum… enaku namma class girls la oru nalla friend na athu nee mattum dhaan. Oru person kita sila vishayatha share panna mudiyadhu — “judge pannuvangalo” nu bayam irukum. Aana nee apdi illa. Unkitta naan neraya per kitta sollatha vishayangalayum share panniruken. Athuku karanam un mela vachiruka trust dhaan… atha nee yepavum break pannala.
          </p>

          <p>
            Again, intha universe ku thanks sollanum. Enna maari oru introvert person ku pasanga kita nalla pesurathe achariyam dhaan. Aana naan namma class rep aanapo… naan pesina first ponnu neetha. Naan rep aagala na, sathiyama solren — unkitta pesirupena nu kooda enakku theriyadhu.
          </p>

          <p>
            Ippo namma nalla friends ah irunthalum, namma onna oru pic kooda edukala… aana lot of memories iruku. Athu eppovume erase aagadhu. Nee sollalaam “yarum enaku ipdi pannala” nu… aana enakku irukura nalla friend neetha — unakku pannama vera yarukku naan pannuva?
          </p>

          <p>
            Friendship ku nalla understanding um care um irundha pothum… antha friendship eppovum break aagadhu. Namma friendship um ippo irukura maari forever irukanum nu nenaikuren… avalo dhaan.
          </p>

          <p>
            Unoda good times mattum illa, bad times layum unakku oru shoulder ah yepovum irupen. Enkitta nee edhunaalum share pannalaam — naan unna judge panna maaten… yenna en friend ah pathi enakku theriyum.
          </p>

          <p>
            Namma class la sila per un character ah purinjikama wrong nu sollirukanga… aana avanga yarum un side la irundhu yosikkala. Apdi pesuravanga kita naan unakku support ah, unna vitukudama dhaan pesiruken. Unakku oru supportive friend ah naan yepovum irupen.
          </p>

          <p>
            Once again, Happy Birthday Poojetha… 🎂
Unoda smile dhaan unoda strength — atha yarukagavum vitukudukatha. Happy ah iru. Unnai purinjika koodiya true friends yepovum unkooda irupom.💜 
          </p>

          <div className="s11-letter-signoff">
            Your Bestfriend,<br />
            Deepak
          </div>

          <div className="s11-fold-btn-container">
            <button className="s11-fold-btn" onClick={onFold}>
              Fold & Return Letter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
