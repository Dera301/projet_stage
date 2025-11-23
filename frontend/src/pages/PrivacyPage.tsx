import React from 'react';

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Politique de confidentialité</h1>
          
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                ColocAntananarivo s'engage à protéger votre vie privée. Cette politique de confidentialité explique comment 
                nous collectons, utilisons, stockons et protégeons vos informations personnelles.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Informations collectées</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Informations que vous nous fournissez</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Nom, prénom, adresse email, numéro de téléphone</li>
                <li>Informations académiques (université, niveau d'études)</li>
                <li>Informations de vérification (CIN, photos d'identité)</li>
                <li>Contenu des annonces et messages</li>
                <li>Photos et images uploadées</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Informations collectées automatiquement</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Adresse IP et données de connexion</li>
                <li>Type de navigateur et appareil</li>
                <li>Pages visitées et interactions</li>
                <li>Données de géolocalisation (si autorisées)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Utilisation des informations</h2>
              <p className="text-gray-700 mb-4">Nous utilisons vos informations pour :</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Fournir et améliorer nos services</li>
                <li>Faciliter la mise en relation entre propriétaires et étudiants</li>
                <li>Vérifier l'identité des utilisateurs</li>
                <li>Communiquer avec vous concernant votre compte</li>
                <li>Assurer la sécurité de la plateforme</li>
                <li>Respecter nos obligations légales</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Partage des informations</h2>
              <p className="text-gray-700 mb-4">
                Nous ne vendons pas vos informations personnelles. Nous pouvons partager vos informations uniquement dans les cas suivants :
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Avec d'autres utilisateurs (propriétaires/étudiants) dans le cadre de la mise en relation</li>
                <li>Avec des prestataires de services tiers (hébergement, paiement) sous contrat de confidentialité</li>
                <li>Lorsque requis par la loi ou pour protéger nos droits</li>
                <li>Avec votre consentement explicite</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Sécurité des données</h2>
              <p className="text-gray-700 mb-4">
                Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données :
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Chiffrement des données sensibles</li>
                <li>Authentification sécurisée</li>
                <li>Accès restreint aux données personnelles</li>
                <li>Surveillance régulière des systèmes</li>
                <li>Sauvegardes régulières</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Conservation des données</h2>
              <p className="text-gray-700 mb-4">
                Nous conservons vos données personnelles aussi longtemps que nécessaire pour :
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Fournir nos services</li>
                <li>Respecter nos obligations légales</li>
                <li>Résoudre les litiges</li>
                <li>Faire respecter nos accords</li>
              </ul>
              <p className="text-gray-700 mb-4">
                Vous pouvez demander la suppression de vos données à tout moment, sous réserve des obligations légales.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Vos droits</h2>
              <p className="text-gray-700 mb-4">Conformément à la réglementation en vigueur, vous avez le droit de :</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Accéder à vos données personnelles</li>
                <li>Corriger des informations inexactes</li>
                <li>Demander la suppression de vos données</li>
                <li>S'opposer au traitement de vos données</li>
                <li>Demander la portabilité de vos données</li>
                <li>Retirer votre consentement à tout moment</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cookies et technologies similaires</h2>
              <p className="text-gray-700 mb-4">
                Nous utilisons des cookies et technologies similaires pour améliorer votre expérience, analyser l'utilisation 
                du site et personnaliser le contenu. Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Modifications de la politique</h2>
              <p className="text-gray-700 mb-4">
                Nous pouvons modifier cette politique de confidentialité à tout moment. Les modifications seront publiées 
                sur cette page avec une date de mise à jour. Nous vous encourageons à consulter régulièrement cette page.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact</h2>
              <p className="text-gray-700 mb-4">
                Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, 
                veuillez nous contacter via la page de contact ou à l'adresse email : contact@colocantananarivo.mg
              </p>
            </section>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;

