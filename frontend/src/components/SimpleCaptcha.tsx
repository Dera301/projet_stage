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
        <div className="flex-1 bg-dark-100 border-2 border-dark-300 rounded px-4 py-2">
          <div className="text-2xl font-bold text-primary-600 tracking-widest text-center select-none">
            {captchaCode.split('').map((char, i) => (
              <span
                key={i}
                style={{
                  transform: `rotate(${Math.random() * 20 - 10}deg)`,
                  display: 'inline-block',
                  margin: '0 2px'
                }}
              >
                {char}
              </span>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={generateCaptcha}
          className="px-3 py-2 bg-dark-200 hover:bg-dark-300 text-dark-900 rounded transition-colors"
          title="Actualiser"
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

