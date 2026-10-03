import React from 'react';
import { ArrowLeft, ShieldCheck, CheckCircle, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VerifiedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="page-transition" style={{ padding: '10px', paddingBottom: '100px', maxWidth: 'var(--max-width)', margin: '0 auto' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '24px' }}>
        <div onClick={() => navigate(-1)} style={{ width: '45px', height: '45px', borderRadius: '14px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', cursor: 'pointer', flexShrink: 0, boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
           <ArrowLeft size={20} color="var(--text-dark)" />
        </div>
      </div>

      {/* Main Content Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '30px' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'linear-gradient(135deg, #f59e0b, #ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 10px 20px rgba(234, 88, 12, 0.3)' }}>
          <ShieldCheck size={32} color="white" />
        </div>
        <div>
          <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#d97706', letterSpacing: '1px', marginBottom: '4px' }}>
            TRUSTED • COMPLIANT • SECURE
          </div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '1.6rem', color: 'var(--text-dark)', fontWeight: '900', lineHeight: '1.2' }}>
            Verified Certifications
          </h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500', lineHeight: '1.5' }}>
            Our operations are backed by globally recognized certifications, ensuring the highest standards of security, compliance and trust.
          </p>
        </div>
      </div>

      {/* Certificate Card */}
      <div className="glass-card" style={{ background: 'white', borderRadius: '24px', padding: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
        
        {/* Certificate Image Placeholder */}
        <div style={{ width: '100%', height: '220px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', position: 'relative', overflow: 'hidden' }}>
          
          {/* User needs to add their actual certificate image here */}
          <img 
            src="/fbr-certificate.png" 
            alt="FBR Registration Certificate" 
            style={{ width: '100%', height: '100%', objectFit: 'contain', zIndex: 1, position: 'absolute' }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />

          {/* Fallback view if image is missing */}
          <div style={{ display: 'none', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 0, width: '100%', height: '100%', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0369a1', marginBottom: '8px' }}>FBR PAKISTAN</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#334155' }}>Certificate of Registration</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '10px' }}>M/S Islamic Profit Limited</div>
            <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: '16px', border: '1px dashed #cbd5e1', padding: '8px', borderRadius: '8px' }}>
              Please place your certificate image in public/fbr-certificate.png
            </div>
          </div>
          
        </div>

        {/* Certificate Info Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
          
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', color: 'var(--text-dark)' }}>
                FBR Registration
              </h2>
              <CheckCircle size={18} color="#d97706" />
            </div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500', lineHeight: '1.4' }}>
              Registered with Directorate General of DNFBP AML/CFT.
            </p>
          </div>

          <button style={{ background: 'transparent', border: '2px solid #d97706', color: '#d97706', padding: '10px 16px', borderRadius: '30px', fontWeight: '800', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', flexShrink: 0 }}>
            Preview <ExternalLink size={16} strokeWidth={3} />
          </button>
          
        </div>
      </div>

    </div>
  );
};

export default VerifiedPage;
