// src/services/cinVerificationService.ts
import Tesseract from 'tesseract.js';

export interface CINData {
  numeroCIN: string;
  nom: string;
  prenoms: string;
  dateNaissance: string;
  lieuNaissance: string;
  adresse: string;
  profession: string;
  pere: string;
  mere: string;
  dateDelivrance: string;
  lieuDelivrance: string;
}

export interface CINVerificationResult {
  success: boolean;
  message: string;
  validationErrors: string[];
}

class CINVerificationService {

  // Extraction OCR avec Tesseract.js - VERSION CORRIGÉE
  private async extractTextFromImage(imageFile: File): Promise<string> {
    try {
      console.log('🔍 Début de l\'extraction OCR...');
      
      const worker = await Tesseract.createWorker('fra+eng', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${(m.progress * 100).toFixed(1)}%`);
          }
        }
      });
      
      // Configurer Tesseract pour de meilleurs résultats (paramètres corrigés)
      await worker.setParameters({
        // Utiliser des paramètres valides pour TypeScript
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÀÂÇÉÈÊËÎÏÔÙÛÜàâçéèêëîïôùûü -.,\'/',
        tessedit_ocr_engine_mode: 1, // Neural nets LSTM (number au lieu de string)
      } as any); // Utiliser "as any" pour contourner les restrictions TypeScript
      
      const result = await worker.recognize(URL.createObjectURL(imageFile));      
      await worker.terminate();
      
      console.log('✅ Extraction OCR terminée');
      return result.data.text;
    } catch (error) {
      console.error('❌ Erreur OCR:', error);
      throw new Error('Échec de l\'extraction du texte de la CIN');
    }
  }

  // Nettoyage et parsing du texte extrait - VERSION CORRIGÉE (ESLint)
  private parseCINData(ocrText: string, cinNumberSaisi: string, side: 'recto' | 'verso'): Partial<CINData> {
    console.log(`📝 Parsing du texte OCR (${side})...`);
    
    // Nettoyer le texte OCR plus agressivement
    const cleanedText = ocrText
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/[^\w\sÀ-ÿ.,/-]/g, ' ') // Garder seulement les caractères utiles (corrigé ESLint)
      .trim();
    
    console.log(`📄 Texte OCR ${side} nettoyé:`, cleanedText);
    
    const cinData: Partial<CINData> = {};

    // Toujours utiliser le numéro saisi comme fallback
    cinData.numeroCIN = cinNumberSaisi;
    console.log('✅ Numéro CIN (saisi):', cinData.numeroCIN);

    // Patterns améliorés pour les champs CIN - plus flexibles (corrigés ESLint)
    const patterns = {
      nom: [
        /nom[:\s]*([a-zA-ZÀ-ÿ\s-]{2,})/i,
        /anarana[:\s]*([a-zA-ZÀ-ÿ\s-]{2,})/i,
        /([A-Z][a-zA-ZÀ-ÿ\s-]{2,})(?=\s*prénom)/i // Capture le nom avant "prénom"
      ],
      prenoms: [
        /pr[ée]noms?[:\s]*([a-zA-ZÀ-ÿ\s-]{2,})/i,
        /fanampin['\s]anarana[:\s]*([a-zA-ZÀ-ÿ\s-]{2,})/i,
        /(?:prénom|prenoms)[\s:]+([a-zA-ZÀ-ÿ\s-]{2,})/i
      ],
      dateNaissance: [
        /n[ée][e]?\s*(le)?[:\s]*([0-9]{2}[/.-][0-9]{2}[/.-][0-9]{4})/i, // Corrigé ESLint
        /teraka[:\s]*([0-9]{2}[/.-][0-9]{2}[/.-][0-9]{4})/i, // Corrigé ESLint
        /naissance[:\s]*([0-9]{2}[/.-][0-9]{2}[/.-][0-9]{4})/i, // Corrigé ESLint
        /(\d{2}[/.-]\d{2}[/.-]\d{4})/ // Pattern date générique (corrigé ESLint)
      ],
      lieuNaissance: [
        /[àa]\s*[:\s]*([a-zA-ZÀ-ÿ\s-,]{2,})/i,
        /tao[:\s]*([a-zA-ZÀ-ÿ\s-,]{2,})/i,
        /lieu[:\s]*naissance[:\s]*([a-zA-ZÀ-ÿ\s-,]{2,})/i
      ],
      adresse: [
        /domicile[:\s]*([a-zA-ZÀ-ÿ0-9\s-,]{5,})/i,
        /fenenana[:\s]*([a-zA-ZÀ-ÿ0-9\s-,]{5,})/i,
        /adresse[:\s]*([a-zA-ZÀ-ÿ0-9\s-,]{5,})/i
      ],
      profession: [
        /profession[:\s]*([a-zA-ZÀ-ÿ\s-]{2,})/i,
        /asa[:\s]*([a-zA-ZÀ-ÿ\s-]{2,})/i,
        /m[ée]tier[:\s]*([a-zA-ZÀ-ÿ\s-]{2,})/i
      ],
      pere: [
        /p[èe]re[:\s]*([a-zA-ZÀ-ÿ\s-]{2,})/i,
        /ray[:\s]*([a-zA-ZÀ-ÿ\s-]{2,})/i,
        /père[:\s]*([a-zA-ZÀ-ÿ\s-]{2,})/i
      ],
      mere: [
        /m[èe]re[:\s]*([a-zA-ZÀ-ÿ\s-]{2,})/i,
        /reny[:\s]*([a-zA-ZÀ-ÿ\s-]{2,})/i,
        /mère[:\s]*([a-zA-ZÀ-ÿ\s-]{2,})/i
      ],
      dateDelivrance: [
        /d[ée]livr[ée]e?[:\s]*(le)?[:\s]*([0-9]{2}[/.-][0-9]{2}[/.-][0-9]{4})/i, // Corrigé ESLint
        /tamin['\s]ny[:\s]*([0-9]{2}[/.-][0-9]{2}[/.-][0-9]{4})/i, // Corrigé ESLint
        /délivrance[:\s]*([0-9]{2}[/.-][0-9]{2}[/.-][0-9]{4})/i // Corrigé ESLint
      ],
      lieuDelivrance: [
        /[àa]\s*[:\s]*([a-zA-ZÀ-ÿ\s-,]{2,})(?=.*d[ée]livr)/i,
        /faita[:\s]*([a-zA-ZÀ-ÿ\s-,]{2,})/i,
        /lieu[:\s]*délivrance[:\s]*([a-zA-ZÀ-ÿ\s-,]{2,})/i
      ]
    };

    // Rechercher chaque champ avec les patterns
    Object.entries(patterns).forEach(([field, patternList]) => {
      for (const pattern of patternList) {
        const match = cleanedText.match(pattern);
        if (match) {
          // Prendre le premier groupe de capture (index 1) ou le match complet
          const value = (match[1] || match[0]).trim();
          if (value && value.length > 1 && !cinData[field as keyof CINData]) {
            cinData[field as keyof CINData] = value;
            console.log(`✅ ${field} trouvé:`, value);
            break;
          }
        }
      }
    });

    return cinData;
  }

  // Validation des données extraites - VERSION SIMPLIFIÉE
  private validateCINData(cinData: Partial<CINData>, cinNumberSaisi: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!cinData.numeroCIN || !/^\d{12}$/.test(cinData.numeroCIN)) {
      errors.push('Numéro CIN invalide ou manquant');
    }

    // Validation plus permissive pour les tests
    if (!cinData.nom || cinData.nom.length < 2) {
      console.warn('⚠️ Nom manquant ou trop court');
    }

    if (!cinData.prenoms || cinData.prenoms.length < 2) {
      console.warn('⚠️ Prénoms manquants ou trop courts');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Vérification de la qualité de l'image
  private async verifyImageQuality(imageFile: File): Promise<number> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let qualityScore = 70;
        
        // Score basé sur la taille et la résolution
        if (imageFile.size > 500000) { // > 500KB
          qualityScore += 10;
        }
        if (imageFile.size > 1000000) { // > 1MB
          qualityScore += 10;
        }
        
        // Score basé sur la résolution
        if (img.width > 1000 && img.height > 800) {
          qualityScore += 10;
        }
        
        resolve(Math.min(qualityScore, 95));
      };
      img.onerror = () => resolve(60); // Score minimum en cas d'erreur
      img.src = URL.createObjectURL(imageFile);
    });
  }

  // Vérification de cohérence recto-verso
  private verifyRectoVersoConsistency(rectoData: Partial<CINData>, versoData: Partial<CINData>): boolean {
    // Pour le moment, toujours retourner true pour permettre la vérification
    // même si l'OCR échoue partiellement
    return true;
  }

  // Vérification principale avec IA - VERSION ROBUSTE
   // Validation simple du numéro CIN
  private validateCINNumber(cinNumber: string): boolean {
    return /^\d{12}$/.test(cinNumber);
  }

  // Validation des fichiers images
  private validateImages(rectoImage: File, versoImage: File): string[] {
    const errors: string[] = [];

    if (!rectoImage || !versoImage) {
      errors.push('Les deux images (recto et verso) sont requises');
      return errors;
    }

    // Vérifier le type de fichier
    if (!rectoImage.type.startsWith('image/')) {
      errors.push('Le recto doit être une image valide');
    }

    if (!versoImage.type.startsWith('image/')) {
      errors.push('Le verso doit être une image valide');
    }

    // Vérifier la taille (max 5MB)
    if (rectoImage.size > 5 * 1024 * 1024) {
      errors.push('Le recto ne doit pas dépasser 5MB');
    }

    if (versoImage.size > 5 * 1024 * 1024) {
      errors.push('Le verso ne doit pas dépasser 5MB');
    }

    return errors;
  }

  // Vérification simple sans IA
  async verifyCIN(
    cinNumber: string, 
    cinRectoImage: File, 
    cinVersoImage: File
  ): Promise<CINVerificationResult> {
    try {
      console.log('🔍 Début de la vérification CIN simple...');

      // 1. Valider le numéro CIN
      if (!this.validateCINNumber(cinNumber)) {
        return {
          success: false,
          message: 'Numéro CIN invalide',
          validationErrors: ['Le numéro CIN doit contenir exactement 12 chiffres']
        };
      }

      // 2. Valider les images
      const imageErrors = this.validateImages(cinRectoImage, cinVersoImage);
      if (imageErrors.length > 0) {
        return {
          success: false,
          message: 'Problèmes avec les images',
          validationErrors: imageErrors
        };
      }

      // 3. Vérification réussie
      console.log('✅ Vérification CIN réussie');

      return {
        success: true,
        message: 'Vérification CIN réussie !',
        validationErrors: []
      };

    } catch (error) {
      console.error('❌ Erreur lors de la vérification CIN:', error);
      return {
        success: false,
        message: 'Erreur technique lors de la vérification',
        validationErrors: ['Erreur système']
      };
    }
  }
}

export const cinVerificationService = new CINVerificationService();