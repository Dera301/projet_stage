import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const steps = [
  {
    title: 'Bienvenue 🎉',
    description: 'Configurez votre profil pour aider la communauté à mieux vous connaître.'
  },
  {
    title: 'Explorez les logements 🏠',
    description: 'Filtrez par quartier, budget ou type pour trouver rapidement une colocation compatible.'
  },
  {
    title: 'Discutez en direct 💬',
    description: 'Utilisez la messagerie intégrée pour planifier des visites ou poser vos questions.'
  },
  {
    title: 'Vérifiez votre identité 🪪',
    description: 'Soumettez votre CIN pour sécuriser les échanges et accéder à toutes les fonctionnalités.'
  }
];

const storageKey = (userId: string) => `coloc.guide.seen.${userId}`;

const FirstLoginGuide: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const hasUser = Boolean(user?.id);

  useEffect(() => {
    if (!hasUser) {
      setIsOpen(false);
      setStepIndex(0);
      return;
    }

    try {
      const seen = localStorage.getItem(storageKey(user!.id));
      if (!seen) {
        setIsOpen(true);
        setStepIndex(0);
      }
    } catch (error) {
      console.warn('Impossible d\'accéder à localStorage pour le guide de bienvenue:', error);
    }
  }, [hasUser, user?.id]);

  const closeGuide = () => {
    if (user?.id) {
      try {
        localStorage.setItem(storageKey(user.id), 'true');
      } catch (error) {
        console.warn('Impossible de mémoriser l\'affichage du guide:', error);
      }
    }
    setIsOpen(false);
  };

  const goToNextStep = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex((prev) => prev + 1);
      return;
    }
    closeGuide();
  };

  const goToPreviousStep = () => {
    setStepIndex((prev) => Math.max(0, prev - 1));
  };

  const currentStep = useMemo(() => steps[stepIndex], [stepIndex]);

  if (!isOpen || !user) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-primary-600 font-semibold">Guide de démarrage</p>
            <h2 className="text-2xl font-bold text-gray-900 mt-1">{currentStep.title}</h2>
          </div>
          <button
            onClick={closeGuide}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fermer le guide"
          >
            ×
          </button>
        </div>

        <p className="text-gray-600 leading-relaxed">{currentStep.description}</p>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Étape {stepIndex + 1} / {steps.length}</span>
          <div className="flex space-x-1">
            {steps.map((_, index) => (
              <span
                key={index}
                className={`h-2 w-8 rounded-full transition-all ${
                  index <= stepIndex ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={goToPreviousStep}
            disabled={stepIndex === 0}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            Précédent
          </button>
          <div className="space-x-3">
            <button
              type="button"
              onClick={closeGuide}
              className="px-4 py-2 rounded-lg border border-transparent text-gray-500 hover:bg-gray-100"
            >
              Passer
            </button>
            <button
              type="button"
              onClick={goToNextStep}
              className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 shadow"
            >
              {stepIndex === steps.length - 1 ? 'Terminer' : 'Suivant'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirstLoginGuide;

