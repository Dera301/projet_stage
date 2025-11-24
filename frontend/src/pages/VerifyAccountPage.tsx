import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const logoSrc = `${process.env.PUBLIC_URL}/logo_colo.svg`;

const VerifyAccountPage: React.FC = () => {
  const { verifyEmail, resendVerificationCode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const locationState = useMemo(() => {
    return (location.state as { pendingId?: string; email?: string } | null) || {};
  }, [location.state]);

  const initialPendingId = locationState.pendingId || searchParams.get('pendingId') || '';
  const initialEmail = locationState.email || searchParams.get('email') || '';

  const [pendingId, setPendingId] = useState(initialPendingId);
  const [email, setEmail] = useState(initialEmail);
  const [verificationCode, setVerificationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    setPendingId(initialPendingId);
    setEmail(initialEmail);
  }, [initialPendingId, initialEmail]);

  useEffect(() => {
    if (!initialPendingId || !initialEmail) {
      toast(
        'Veuillez vérifier votre boîte mail et suivre le lien reçu pour valider votre compte.',
        { icon: '📩' }
      );
    }
  }, [initialPendingId, initialEmail]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!pendingId) {
      toast.error('Identifiant de vérification manquant. Merci de recommencer votre inscription.');
      return;
    }
    if (!verificationCode) {
      toast.error('Veuillez saisir le code de vérification.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await verifyEmail(pendingId, verificationCode);
      if (result.success) {
        toast.success('Compte vérifié avec succès ! Vous pouvez maintenant vous connecter.');
        navigate('/login');
      } else {
        toast.error(result.message || 'Échec de la vérification du compte.');
      }
    } catch (error: any) {
      console.error('Erreur lors de la vérification du compte:', error);
      toast.error(error.message || 'Code de vérification invalide ou expiré');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error('Veuillez indiquer une adresse email valide.');
      return;
    }

    setIsResending(true);
    try {
      const result = await resendVerificationCode({ email, registrationId: pendingId || undefined });
      if (!result.success) {
        toast.error(result.message || 'Impossible d\'envoyer un nouveau code');
      }
    } catch (error: any) {
      console.error('Erreur lors du renvoi du code:', error);
      toast.error(error.message || 'Impossible d\'envoyer un nouveau code');
    } finally {
      setIsResending(false);
    }
  };

  if (!pendingId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="max-w-lg w-full space-y-6 bg-white shadow-xl rounded-xl p-8 text-center">
          <img src={logoSrc} alt="ColocAntananarivo" className="h-12 mx-auto" />
          <h1 className="text-2xl font-bold text-gray-900">Vérification requise</h1>
          <p className="text-gray-600">
            Nous ne trouvons pas d'inscription en attente. Cliquez sur le bouton ci-dessous pour recommencer la création de votre compte.
          </p>
          <Link
            to="/register"
            className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-6 py-2 text-base font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <img src={logoSrc} alt="ColocAntananarivo" className="h-12 w-auto" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Confirmez votre adresse email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Entrez le code de 6 chiffres reçu à <span className="font-medium">{email || 'votre email'}</span>.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="pendingId" className="block text-sm font-medium text-gray-700">
                Identifiant d'inscription
              </label>
              <input
                id="pendingId"
                name="pendingId"
                type="text"
                value={pendingId}
                onChange={(e) => setPendingId(e.target.value)}
                className="input-field mt-1"
                readOnly={!locationState.pendingId}
              />
              <p className="text-xs text-gray-500 mt-1">
                Conservez cet identifiant pour toute assistance. Il est inclus dans le lien reçu par email.
              </p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field mt-1"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
                Code de vérification
              </label>
              <input
                id="verificationCode"
                name="verificationCode"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="input-field mt-1 text-center tracking-widest text-lg"
                placeholder="123456"
                maxLength={6}
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Pas reçu de code ?</span>
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="font-medium text-primary-600 hover:text-primary-500 disabled:opacity-50"
              >
                {isResending ? 'Envoi...' : 'Renvoyer le code'}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Vérification...' : 'Activer mon compte'}
            </button>

            <p className="text-center text-sm text-gray-600">
              Vous avez déjà validé votre adresse ?{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Connectez-vous
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyAccountPage;

