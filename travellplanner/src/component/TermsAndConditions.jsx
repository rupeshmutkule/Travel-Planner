export default function TermsAndConditions({ isOpen, onClose, onAccept }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
    }}>
      <div style={{
        maxWidth: '800px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        background: 'rgba(20, 20, 30, 0.95)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '25px',
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.4)',
            cursor: 'pointer',
            fontSize: '24px',
            padding: '5px',
            zIndex: 10,
            transition: 'color 0.3s ease'
          }}
          onMouseEnter={(e) => e.target.style.color = '#38bdf8'}
          onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.4)'}
        >
          ✕
        </button>

        <h1 style={{
          fontSize: '32px',
          fontWeight: '300',
          marginBottom: '30px',
          background: 'linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontFamily: "'Georgia', 'Times New Roman', serif",
        }}>Terms and Conditions</h1>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          color: 'rgba(226, 232, 240, 0.8)',
          lineHeight: '1.6',
          fontFamily: "'Georgia', 'Times New Roman', serif",
        }}>
          <section>
            <h2 style={{ color: '#38bdf8', fontSize: '18px', marginBottom: '12px' }}>1. Acceptance of Terms</h2>
            <p>By accessing and using Travell Planner, you agree to be bound by these Terms and Conditions and all applicable laws and regulations.</p>
          </section>

          <section>
            <h2 style={{ color: '#38bdf8', fontSize: '18px', marginBottom: '12px' }}>2. Use of Service</h2>
            <p>Our service provides AI-generated travel plans. While we strive for accuracy, we cannot guarantee the availability or quality of suggested locations, hotels, or activities. Users are responsible for verifying all travel details.</p>
          </section>

          <section>
            <h2 style={{ color: '#38bdf8', fontSize: '18px', marginBottom: '12px' }}>3. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.</p>
          </section>

          <section>
            <h2 style={{ color: '#38bdf8', fontSize: '18px', marginBottom: '12px' }}>4. Privacy Policy</h2>
            <p>Your privacy is important to us. Please review our Privacy Policy to understand how we collect and use your information.</p>
          </section>

          <section>
            <h2 style={{ color: '#38bdf8', fontSize: '18px', marginBottom: '12px' }}>5. Limitation of Liability</h2>
            <p>Travell Planner shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use our services.</p>
          </section>
        </div>

        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={onAccept}
            style={{
              padding: '16px 40px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #38bdf8, #6366f1)',
              color: '#fff',
              fontSize: '16px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 10px 20px rgba(56, 189, 248, 0.2)',
              transition: 'all 0.3s ease'
            }}
          >
            I Accept & Continue
          </button>
        </div>

        <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
          © 2026 Travell Planner. All rights reserved.
        </div>
      </div>
    </div>
  );
}
