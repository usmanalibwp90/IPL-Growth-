import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Crown, LogIn, UserPlus, BarChart2, Award, Star, Image, ChevronRight, Users, ShieldCheck, Globe, Shield, CheckCircle, FileText, ArrowUpRight, Headphones, MessageCircle, MessageSquare, Phone, Clock, ArrowRight } from 'lucide-react';

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const slideImages = ['/slider1.jpg', '/slider2.jpg', '/slider3.jpg', '/slider4.jpg'];

  const [homeConfig, setHomeConfig] = useState({
    heroTagline: 'Welcome to IPL Growth',
    heroTitle1: 'Islamic Profit',
    heroTitle2: 'Limited.',
    heroSubtitle: 'Experience the premium way to grow your digital assets securely and instantly.',
    supportTagline: 'SUPPORT • ASSISTANCE • TRUST',
    supportTitle: 'Need Help?',
    supportDescription: 'Our support team is here for you. Get quick assistance through WhatsApp or give us a call. We are committed to providing reliable support with transparency and trust.',
    whatsappNumber: '+923001234567',
    telegramChannel: 't.me/iplgrowth',
    callNumber: '+923001234567'
  });

  // Auto swipe logic
  useEffect(() => {
    const savedHomeConfig = localStorage.getItem('home_config');
    if (savedHomeConfig) {
      setHomeConfig(JSON.parse(savedHomeConfig));
    }

    // Add image background for HomePage
    const originalStyle = document.body.getAttribute('style');
    document.body.style.backgroundImage = `
      linear-gradient(rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2)),
      url('/bg.jpg')
    `;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slideImages.length - 1 ? 0 : prev + 1));
    }, 4000); // Change slide every 4 seconds
    
    return () => {
      clearInterval(timer);
      if (originalStyle !== null) {
        document.body.setAttribute('style', originalStyle);
      } else {
        document.body.removeAttribute('style');
      }
    };
  }, []);

  const handleDragStart = (e) => {
    setIsDragging(true);
    setTouchStart(e.targetTouches ? e.targetTouches[0].clientX : e.clientX);
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    setTouchEnd(e.targetTouches ? e.targetTouches[0].clientX : e.clientX);
  };

  const handleDragEnd = () => {
    if (!touchStart || !touchEnd) {
      setIsDragging(false);
      return;
    }
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 40;
    const isRightSwipe = distance < -40;

    if (isLeftSwipe) {
      setCurrentSlide((prev) => (prev === slideImages.length - 1 ? 0 : prev + 1));
    } else if (isRightSwipe) {
      setCurrentSlide((prev) => (prev === 0 ? slideImages.length - 1 : prev - 1));
    }
    
    setTouchStart(0);
    setTouchEnd(0);
    setIsDragging(false);
  };

  return (
    <div className="content-area" style={{ paddingBottom: '40px' }}>
      
      {/* Top Header */}
      <header className="flex-between mb-4 glass-pill" style={{ padding: '8px 12px' }}>
        <div className="brand flex-center" style={{ gap: '10px', marginLeft: '4px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            <img src="/logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800' }}>Islamic Profit Limited</h3>
        </div>
        <button style={{ border: 'none', background: 'var(--gradient-gold)', color: 'white', width: '36px', height: '36px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(234, 88, 12, 0.3)' }}>
          <Menu size={20} />
        </button>
      </header>

      {/* Hero Section */}
      <div className="glass-card mb-4" style={{ padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.8)', padding: '6px 16px', borderRadius: '30px', fontSize: '0.75rem', fontWeight: '700', marginBottom: '24px', color: '#b45309', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <Crown size={14} color="#d97706" />
          {homeConfig.heroTagline}
        </div>
        
        <h1 style={{ fontSize: '2.5rem', lineHeight: '1.1', marginBottom: '16px', color: '#1f2937', letterSpacing: '-0.5px' }}>
          {homeConfig.heroTitle1}<br />
          <span style={{ background: 'var(--gradient-gold)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '800' }}>{homeConfig.heroTitle2}</span>
        </h1>
        
        <p className="mb-4" style={{ fontSize: '0.9rem', color: '#4b5563', maxWidth: '300px', margin: '0 auto 32px auto', lineHeight: '1.6' }}>
          {homeConfig.heroSubtitle}
        </p>
        
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Link to="/login" className="btn btn-light" style={{ flex: 1, padding: '16px', borderRadius: '20px' }}>
            <LogIn size={18} /> Login
          </Link>
          <Link to="/register" className="btn btn-primary" style={{ flex: 1, padding: '16px', borderRadius: '20px' }}>
            <UserPlus size={18} /> Register
          </Link>
        </div>
      </div>

      {/* Image Slider Section */}
      <div 
        className="glass-card mb-4" 
        style={{ overflow: 'hidden', padding: '6px', cursor: isDragging ? 'grabbing' : 'grab' }}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
      >
        <div style={{ borderRadius: '20px', overflow: 'hidden', position: 'relative', height: '180px', background: 'var(--gradient-gold)', pointerEvents: 'none' }}>
          
          <div style={{ 
            display: 'flex', 
            width: '400%', // 4 images
            height: '100%', 
            transition: 'transform 0.5s ease-in-out',
            transform: `translateX(-${currentSlide * 25}%)`
          }}>
            {slideImages.map((src, idx) => (
              <div key={idx} style={{ width: '25%', height: '100%', position: 'relative' }}>
                <img 
                  src={src} 
                  alt={`Slider Image ${idx + 1}`} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                  onError={(e) => { 
                    e.target.style.display = 'none'; 
                    e.target.parentElement.style.background = 'var(--gradient-gold)'; 
                  }} 
                />
              </div>
            ))}
          </div>

          <div className="flex-center" style={{ position: 'absolute', bottom: '12px', left: 0, right: 0, gap: '6px' }}>
            {slideImages.map((_, idx) => (
              <div 
                key={idx} 
                style={{ 
                  width: currentSlide === idx ? '20px' : '6px', 
                  height: '6px', 
                  borderRadius: '10px', 
                  background: currentSlide === idx ? '#fbbf24' : 'rgba(255,255,255,0.8)',
                  transition: 'all 0.3s ease'
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Information Section */}
      <div className="glass-card mb-4" style={{ padding: '24px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
          <div className="icon-box" style={{ flexShrink: 0 }}>
            <BarChart2 size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', margin: '0 0 4px 0', fontWeight: '800', color: '#1f2937', letterSpacing: '-0.2px' }}>
              Choose <span style={{ background: 'var(--gradient-gold)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Your</span> Investment <span style={{ background: 'var(--gradient-gold)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Plan</span>
            </h2>
            <p style={{ fontSize: '0.75rem', margin: 0, lineHeight: '1.4' }}>Explore our active plans below. Review earnings and duration, then proceed securely.</p>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {[
            { name: 'Plan 1', invest: 'Rs460', profit: 'Rs4,590' },
            { name: 'Plan 2', invest: 'Rs860', profit: 'Rs8,595' },
            { name: 'Plan 3', invest: 'Rs1,860', profit: 'Rs18,585' },
            { name: 'Plan 4', invest: 'Rs3,660', profit: 'Rs33,570' },
            { name: 'Plan 5', invest: 'Rs8,860', profit: 'Rs88,560' },
            { name: 'Plan 6', invest: 'Rs16,560', profit: 'Rs165,600' },
            { name: 'Plan 7', invest: 'Rs35,560', profit: 'Rs355,590' },
            { name: 'Plan 8', invest: 'Rs65,660', profit: 'Rs655,560' },
            { name: 'Plan 9', invest: 'Rs112,560', profit: 'Rs1,125,585' },
            { name: 'Plan 10', invest: 'Rs145,560', profit: 'Rs1,455,570' },
            { name: 'Plan 11', invest: 'Rs185,560', profit: 'Rs1,855,575' },
            { name: 'Plan 12', invest: 'Rs225,560', profit: 'Rs2,255,580' }
          ].map((plan, i) => {
            const op = [0.8, 0.9, 1][i % 3];
            return (
              <Link 
                to="/register"
                key={i} 
                style={{ 
                  borderRadius: '16px', 
                  background: 'var(--gradient-gold)',
                  boxShadow: '0 4px 15px rgba(234, 88, 12, 0.25)',
                  padding: '10px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  textDecoration: 'none',
                  color: 'inherit'
                }}
              >
                {/* Plan Badge */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: '0.7rem', fontWeight: '800', padding: '3px 10px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    {plan.name}
                  </div>
                </div>

                {/* Values Container */}
                <div style={{ background: 'rgba(0,0,0,0.15)', borderRadius: '12px', padding: '8px 6px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, justifyContent: 'center' }}>
                  
                  {/* Invest Row */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                    <span style={{ fontSize: '0.55rem', fontWeight: '800', color: 'rgba(255,255,255,0.75)', letterSpacing: '0.5px' }}>INVEST</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#fff' }}>{plan.invest}</span>
                  </div>
                  
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.2)', width: '80%', margin: '0 auto' }}></div>
                  
                  {/* Profit Row */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                    <span style={{ fontSize: '0.55rem', fontWeight: '800', color: 'rgba(255,255,255,0.75)', letterSpacing: '0.5px' }}>PROFIT</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#fff' }}>{plan.profit}</span>
                  </div>

                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Verified Certifications Section */}
      <div className="glass-card mb-4" style={{ padding: '30px 20px', background: 'rgba(255,255,255,0.85)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'var(--gradient-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0, boxShadow: '0 4px 10px rgba(217, 119, 6, 0.3)' }}>
            <ShieldCheck size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.6rem', fontWeight: '800', color: '#b45309', letterSpacing: '1px', marginBottom: '4px' }}>TRUSTED • COMPLIANT • SECURE</div>
            <h2 style={{ fontSize: '1.4rem', margin: '0 0 8px 0', fontWeight: '800', color: '#1f2937' }}>Verified Certifications</h2>
            <p style={{ fontSize: '0.75rem', margin: 0, color: '#4b5563', lineHeight: '1.5' }}>
              Our operations are backed by globally recognized certifications, ensuring the highest standards of security, compliance and trust.
            </p>
          </div>
        </div>

        {/* Certificates Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          


          {/* FBR Certificate */}
          <div style={{ background: '#fff', borderRadius: '20px', padding: '16px', border: '1px solid rgba(217,119,6,0.1)', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <div style={{ background: '#fdfbf7', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px', textAlign: 'center', position: 'relative', marginBottom: '16px', overflow: 'hidden' }}>
              <img src="/fbr-certificate.png" alt="FBR Certificate" style={{ width: '100%', height: 'auto', borderRadius: '4px', border: '1px solid #e5e7eb', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }} />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <h3 style={{ fontSize: '0.9rem', margin: 0, fontWeight: '800', color: '#1f2937' }}>FBR Registration</h3>
                  <CheckCircle size={14} color="#d97706" fill="#fef3c7" />
                </div>
                <p style={{ fontSize: '0.7rem', color: '#6b7280', margin: 0, lineHeight: '1.4', maxWidth: '200px' }}>Registered with Directorate General of DNFBPs AML/CFT.</p>
              </div>
              <button style={{ background: '#fff', border: '1px solid #d97706', color: '#d97706', borderRadius: '30px', padding: '6px 12px', fontSize: '0.7rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Preview <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
          
        </div>

        {/* 3 Bottom Highlights */}
        <div style={{ background: '#fff', borderRadius: '20px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--gradient-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
              <Shield size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#1f2937', marginBottom: '2px' }}>Built on Credibility</div>
              <div style={{ fontSize: '0.65rem', color: '#6b7280', lineHeight: '1.3' }}>Recognized certifications from global standards organizations.</div>
            </div>
          </div>

          <div style={{ height: '1px', background: '#f3f4f6', width: '100%' }}></div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--gradient-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
              <FileText size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#1f2937', marginBottom: '2px' }}>Compliant by Design</div>
              <div style={{ fontSize: '0.65rem', color: '#6b7280', lineHeight: '1.3' }}>We follow industry best practices and regulatory requirements.</div>
            </div>
          </div>

          <div style={{ height: '1px', background: '#f3f4f6', width: '100%' }}></div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--gradient-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
              <Users size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#1f2937', marginBottom: '2px' }}>Greater Client Confidence</div>
              <div style={{ fontSize: '0.65rem', color: '#6b7280', lineHeight: '1.3' }}>Your assets and data are managed with proven security and care.</div>
            </div>
          </div>

        </div>

      </div>

      {/* Need Help / Support Section */}
      <div className="glass-card mb-4" style={{ padding: '30px 20px', background: 'rgba(255,255,255,0.85)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Left/Top Content */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--gradient-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0, boxShadow: '0 4px 10px rgba(217, 119, 6, 0.3)' }}>
              <Headphones size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.6rem', fontWeight: '800', color: '#b45309', letterSpacing: '1px', marginBottom: '4px' }}>{homeConfig.supportTagline}</div>
              <h2 style={{ fontSize: '1.8rem', margin: '0', fontWeight: '800', color: '#1f2937', letterSpacing: '-0.5px' }}>{homeConfig.supportTitle}</h2>
            </div>
          </div>
          
          <p style={{ fontSize: '0.8rem', color: '#4b5563', lineHeight: '1.5', marginBottom: '24px' }}>
            {homeConfig.supportDescription}
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px', marginBottom: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(217,119,6,0.1)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={16} />
              </div>
              <div style={{ fontSize: '0.6rem', fontWeight: '700', color: '#4b5563', textAlign: 'center' }}>Trusted<br/>Support</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(217,119,6,0.1)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={16} />
              </div>
              <div style={{ fontSize: '0.6rem', fontWeight: '700', color: '#4b5563', textAlign: 'center' }}>Real<br/>People</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(217,119,6,0.1)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={16} />
              </div>
              <div style={{ fontSize: '0.6rem', fontWeight: '700', color: '#4b5563', textAlign: 'center' }}>Quick<br/>Response</div>
            </div>
          </div>
        </div>

        {/* Right/Bottom Action Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* WhatsApp Number */}
          <a href={`https://wa.me/${homeConfig.whatsappNumber}`} target="_blank" rel="noreferrer" style={{ background: '#fff', border: '1px solid rgba(217,119,6,0.15)', borderRadius: '16px', padding: '16px', display: 'flex', gap: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', textDecoration: 'none' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--gradient-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
              {homeConfig.whatsappIcon ? <img src={homeConfig.whatsappIcon} alt="Icon" style={{width: '24px', height: '24px', objectFit: 'contain'}} /> : <MessageCircle size={24} />}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#1f2937', margin: '0 0 4px 0' }}>WhatsApp Number</h3>
              <p style={{ fontSize: '0.7rem', color: '#6b7280', margin: '0 0 12px 0', lineHeight: '1.3' }}>Chat with our support team for quick assistance.</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ background: '#fef3c7', color: '#b45309', padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700' }}>
                  Message Support
                </div>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #d97706', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          </a>

          {/* WhatsApp Channel */}
          <a href={`${homeConfig.whatsappChannel}`} target="_blank" rel="noreferrer" style={{ background: '#fff', border: '1px solid rgba(217,119,6,0.15)', borderRadius: '16px', padding: '16px', display: 'flex', gap: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', textDecoration: 'none' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--gradient-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
              {homeConfig.whatsappChannelIcon ? <img src={homeConfig.whatsappChannelIcon} alt="Icon" style={{width: '24px', height: '24px', objectFit: 'contain'}} /> : <Users size={24} />}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#1f2937', margin: '0 0 4px 0' }}>WhatsApp Channel</h3>
              <p style={{ fontSize: '0.7rem', color: '#6b7280', margin: '0 0 12px 0', lineHeight: '1.3' }}>Join our community channel for daily updates.</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ background: '#fef3c7', color: '#b45309', padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700' }}>
                  Join Channel
                </div>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #d97706', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          </a>

          {/* Telegram Channel */}
          <a href={`https://${homeConfig.telegramChannel}`} target="_blank" rel="noreferrer" style={{ background: '#fff', border: '1px solid rgba(217,119,6,0.15)', borderRadius: '16px', padding: '16px', display: 'flex', gap: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', textDecoration: 'none' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--gradient-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
              {homeConfig.telegramIcon ? <img src={homeConfig.telegramIcon} alt="Icon" style={{width: '24px', height: '24px', objectFit: 'contain'}} /> : <MessageSquare size={24} />}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#1f2937', margin: '0 0 4px 0' }}>Telegram Channel</h3>
              <p style={{ fontSize: '0.7rem', color: '#6b7280', margin: '0 0 12px 0', lineHeight: '1.3' }}>Follow our official updates for the latest news and announcements.</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ background: '#fef3c7', color: '#b45309', padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700' }}>
                  Follow our updates
                </div>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #d97706', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          </a>

        </div>
      </div>

      {/* Footer */}
      <div className="text-center" style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', paddingBottom: '10px' }}>
        © 2026 Islamic Profit Limited. All rights reserved.
      </div>
    </div>
  );
};

export default HomePage;
