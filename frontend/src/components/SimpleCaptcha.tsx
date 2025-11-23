import React, { useState, useEffect } from 'react';

interface SimpleCaptchaProps {
  onVerify: (verified: boolean) => void;
}

const SimpleCaptcha: React.FC<SimpleCaptchaProps> = ({ onVerify }) => {
  const [captchaValue, setCaptchaValue] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setCaptchaValue('');
    setError(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setCaptchaValue(value);
    setError(false);
    
    if (value.length === 5) {
      const verified = value === captchaCode;
      onVerify(verified);
      if (!verified) {
        setError(true);
      }
    } else {
      onVerify(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-3">
        <div className="flex-1">
          <div className="relative w-full rounded-md border border-gray-300 bg-white px-4 py-2 overflow-hidden shadow-sm">
            {/* Bruit de fond léger */}
            <div className="absolute inset-0 opacity-30 pointer-events-none">
              <div className="w-full h-px bg-gray-200 absolute top-1/3" />
              <div className="w-full h-px bg-gray-200 absolute top-2/3" />
              <div className="h-full w-px bg-gray-200 absolute left-1/4" />
              <div className="h-full w-px bg-gray-200 absolute left-2/3" />
            </div>

            <div className="relative text-2xl font-bold text-primary-700 tracking-[0.4em] text-center select-none">
              {captchaCode.split('').map((char, i) => (
                <span
                  key={i}
                  style={{
                    transform: `rotate(${Math.random() * 24 - 12}deg)`,
                    display: 'inline-block',
                    margin: '0 3px'
                  }}
                  className="inline-block drop-shadow-sm"
                >
                  {char}
                </span>
              ))}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={generateCaptcha}
          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md border border-gray-300 text-sm font-medium transition-colors"
          title="Actualiser le code"
        >
          ↻
        </button>
      </div>
      <input
        type="text"
        value={captchaValue}
        onChange={handleChange}
        maxLength={5}
        placeholder="Entrez le code ci-dessus"
        className={`input-field ${error ? 'border-red-500' : ''}`}
        style={{ textTransform: 'uppercase' }}
      />
      {error && (
        <p className="text-xs text-red-600">Code incorrect, veuillez réessayer</p>
      )}
    </div>
  );
};

export default SimpleCaptcha;

