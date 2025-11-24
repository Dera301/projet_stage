/**
 * Système de gestion d'erreurs amélioré
 * Convertit les codes d'erreur HTTP en messages utilisateur clairs
 * et adapte l'affichage selon l'appareil (mobile/PC)
 */

export interface ErrorInfo {
  message: string;
  title?: string;
  icon?: string;
  isMobile?: boolean;
}

/**
 * Détecte si l'appareil est mobile
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Convertit un code d'erreur HTTP en message utilisateur clair
 */
export const getErrorMessage = (error: any, defaultMessage?: string): ErrorInfo => {
  const isMobile = isMobileDevice();
  let message = defaultMessage || 'Une erreur est survenue';
  let title = 'Erreur';
  let icon = '⚠️';

  // Si c'est déjà un message d'erreur formaté
  if (typeof error === 'string') {
    message = error;
  } else if (error?.message) {
    message = error.message;
  } else if (error?.response?.data?.message) {
    message = error.response.data.message;
  } else if (error?.response?.data?.error) {
    message = error.response.data.error;
  }

  // Extraire le code d'erreur si présent
  const statusCode = error?.response?.status || error?.status || error?.code;

  // Messages spécifiques selon le code d'erreur
  switch (statusCode) {
    case 400:
      title = 'Requête invalide';
      message = message.includes('400') || message.includes('Bad Request')
        ? 'Les informations fournies sont incorrectes. Veuillez vérifier vos données.'
        : message;
      icon = '❌';
      break;

    case 401:
      title = 'Non autorisé';
      message = 'Votre session a expiré. Veuillez vous reconnecter.';
      icon = '🔒';
      break;

    case 403:
      title = 'Accès refusé';
      message = message.includes('403') || message.includes('Forbidden')
        ? 'Vous n\'avez pas les permissions nécessaires pour effectuer cette action.'
        : message;
      icon = '🚫';
      break;

    case 404:
      title = 'Ressource introuvable';
      message = message.includes('404') || message.includes('Not Found')
        ? 'La ressource demandée n\'existe pas ou a été supprimée.'
        : message;
      icon = '🔍';
      break;

    case 409:
      title = 'Conflit';
      message = message.includes('409') || message.includes('Conflict')
        ? 'Cette action entre en conflit avec l\'état actuel. Veuillez réessayer.'
        : message;
      icon = '⚠️';
      break;

    case 422:
      title = 'Données invalides';
      message = message.includes('422') || message.includes('Unprocessable')
        ? 'Les données fournies ne sont pas valides. Veuillez vérifier tous les champs.'
        : message;
      icon = '📝';
      break;

    case 429:
      title = 'Trop de requêtes';
      message = 'Vous avez effectué trop de requêtes. Veuillez patienter quelques instants.';
      icon = '⏱️';
      break;

    case 500:
      title = 'Erreur serveur';
      message = message.includes('500') || message.includes('Internal Server Error')
        ? 'Une erreur technique est survenue. Notre équipe a été notifiée. Veuillez réessayer plus tard.'
        : message;
      icon = '🔧';
      break;

    case 502:
      title = 'Service indisponible';
      message = 'Le service est temporairement indisponible. Veuillez réessayer dans quelques instants.';
      icon = '🔌';
      break;

    case 503:
      title = 'Service en maintenance';
      message = 'Le service est en maintenance. Veuillez réessayer plus tard.';
      icon = '🔧';
      break;

    case 'NETWORK_ERROR':
    case 'NetworkError':
      title = 'Problème de connexion';
      message = 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
      icon = '📡';
      break;

    case 'TIMEOUT':
      title = 'Délai d\'attente dépassé';
      message = 'La requête a pris trop de temps. Veuillez réessayer.';
      icon = '⏱️';
      break;

    default:
      // Nettoyer les messages qui contiennent des codes d'erreur
      message = message
        .replace(/\b(40[0-9]|50[0-9])\b/g, '')
        .replace(/\b(Error|Erreur)\s*:\s*/gi, '')
        .replace(/\b(HTTP|Status)\s*[:\s]*\d+/gi, '')
        .trim();

      if (!message || message.length < 5) {
        message = 'Une erreur inattendue est survenue. Veuillez réessayer.';
      }
  }

  // Messages spécifiques pour certaines erreurs courantes
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('email') && lowerMessage.includes('déjà') || lowerMessage.includes('already exists')) {
    message = 'Cet email est déjà utilisé. Veuillez utiliser une autre adresse email.';
    icon = '📧';
  } else if (lowerMessage.includes('password') || lowerMessage.includes('mot de passe')) {
    message = 'Le mot de passe est incorrect. Veuillez réessayer.';
    icon = '🔑';
  } else if (lowerMessage.includes('token') || lowerMessage.includes('authentification')) {
    message = 'Votre session a expiré. Veuillez vous reconnecter.';
    icon = '🔒';
  } else if (lowerMessage.includes('not found') || lowerMessage.includes('introuvable')) {
    message = 'La ressource demandée n\'existe pas.';
    icon = '🔍';
  } else if (lowerMessage.includes('permission') || lowerMessage.includes('autorisé')) {
    message = 'Vous n\'avez pas les permissions nécessaires pour cette action.';
    icon = '🚫';
  }

  return {
    message: message.charAt(0).toUpperCase() + message.slice(1),
    title,
    icon,
    isMobile
  };
};

/**
 * Formate un message d'erreur pour l'affichage
 */
export const formatErrorForDisplay = (error: any, defaultMessage?: string): string => {
  const errorInfo = getErrorMessage(error, defaultMessage);
  return errorInfo.message;
};

/**
 * Classe CSS pour l'affichage des erreurs selon l'appareil
 */
export const getErrorClasses = (): string => {
  const isMobile = isMobileDevice();
  return isMobile
    ? 'fixed bottom-4 left-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm mx-auto'
    : 'fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md';
};

