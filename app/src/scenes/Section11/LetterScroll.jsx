import React, { useState } from 'react';
import { rtdb } from '../../firebase';
import { ref, push, serverTimestamp } from 'firebase/database';
import { trackEvent } from '../../analytics';
import './LetterScroll.css';

export default function LetterScroll({ show, onFold }) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sendingState, setSendingState] = useState('idle'); // 'idle', 'sending', 'sent'

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setSendingState('stamping');
    try {
      const repliesRef = ref(rtdb, 'lunar_analytics/replies');
      await push(repliesRef, {
        text: replyText,
        timestamp: serverTimestamp()
      });
      trackEvent('Section11', 'letter_reply_sent', { length: replyText.length });
      
      // 1. Show stamping animation (1.5s)
      // 2. Play fly away animation (1.5s)
      setTimeout(() => {
        setSendingState('flying');
      }, 1500);

      setTimeout(() => {
        setSendingState('sent');
      }, 3000);
    } catch (e) {
      console.error("Failed to send reply:", e);
      setSendingState('idle'); // revert so she can try again
    }
  };

  if (!show) return null;

  return (
    <div className={`s11-letter-overlay ${show ? 'show' : ''}`}>
      {sendingState === 'sent' ? (
        <div className="s11-sent-message-container" style={{ zIndex: 200 }}>
          <div className="s11-magical-seal" style={{ position: 'relative', width: '100px', height: '100px', fontSize: '3rem', margin: '0 auto 20px auto', boxShadow: 'none', animation: 'none', opacity: 1, filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.3))' }}>🌙</div>
          <div className="s11-sent-text">Your message is safely sealed<br/>and flying its way to him...</div>
          <button className="s11-fold-btn mt-20" onClick={onFold}>
            Close & Continue
          </button>
        </div>
      ) : (
        <div className={`s11-paper-container ${sendingState === 'flying' ? 's11-fly-away' : ''}`}>
          {isReplying ? (
            <div className={`s11-letter-content s11-reply-view ${(sendingState === 'stamping' || sendingState === 'flying') ? 'is-sending' : ''}`}>
              <>
                <div className="s11-letter-greeting" style={{ textAlign: 'center', marginBottom: '20px' }}>Your Reply</div>
                <textarea 
                  className="s11-reply-textarea"
                  placeholder="Write your thoughts here..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  disabled={sendingState !== 'idle'}
                />
                
                {/* Overlay the massive Wax Seal while sending! */}
                {(sendingState === 'stamping' || sendingState === 'flying') && (
                  <div className="s11-magical-seal-container">
                    <div className="s11-magical-seal">🌙</div>
                    <div className="s11-seal-sparks"></div>
                  </div>
                )}

                <div className="s11-fold-btn-container" style={{ marginTop: 'auto', zIndex: 100 }}>
                  {sendingState === 'idle' && (
                    <>
                      <button className="s11-fold-btn mr-15" style={{ background: 'transparent', color: '#a05030', border: '1px solid #a05030', boxShadow: 'none' }} onClick={() => setIsReplying(false)}>
                        Cancel
                      </button>
                      <button className="s11-fold-btn s11-send-btn" onClick={handleSendReply}>
                        Seal & Send
                      </button>
                    </>
                  )}
                  {(sendingState === 'stamping' || sendingState === 'flying') && (
                    <div className="s11-sending-text">Sealing with magic...</div>
                  )}
                </div>
              </>
            </div>
          ) : (
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
              <button className="s11-fold-btn mr-15" onClick={() => setIsReplying(true)}>
                Write a Reply
              </button>
              <button className="s11-fold-btn" style={{ background: 'transparent', color: '#a05030', border: '1px solid #a05030', boxShadow: 'none' }} onClick={onFold}>
                Return Letter
              </button>
            </div>
          </div>
        )}
        </div>
      )}
    </div>
  );
}
