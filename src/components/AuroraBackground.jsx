import './AuroraBackground.css';

const AuroraBackground = ({ children }) => (
  <>
    <div className="bg-layer" aria-hidden="true">
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />
      <div className="bg-star bg-star-1" />
      <div className="bg-star bg-star-2" />
      <div className="bg-star bg-star-3" />
      <div className="bg-star bg-star-4" />
      <div className="bg-star bg-star-5" />
      <div className="bg-star bg-star-6" />
    </div>
    <div className="aurora-container">
      {children}
    </div>
  </>
);

export default AuroraBackground;
