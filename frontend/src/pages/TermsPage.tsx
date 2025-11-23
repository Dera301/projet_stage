import React from 'react';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Conditions d'utilisation</h1>
          
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptation des conditions</h2>
              <p className="text-gray-700 mb-4">
                En accédant et en utilisant la plateforme ColocAntananarivo, vous acceptez d'être lié par ces conditions d'utilisation. 
                Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description du service</h2>
              <p className="text-gray-700 mb-4">
                ColocAntananarivo est une plateforme de mise en relation entre propriétaires et étudiants cherchant un logement 
                à Antananarivo, Madagascar. Nous facilitons la recherche de colocation et la publication d'annonces.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Inscription et compte utilisateur</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Vous devez être âgé d'au moins 18 ans pour créer un compte</li>
                <li>Vous êtes responsable de maintenir la confidentialité de vos identifiants</li>
                <li>Vous devez fournir des informations exactes et à jour</li>
                <li>Les propriétaires doivent vérifier leur identité via la CIN</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Obligations des utilisateurs</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Propriétaires</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Publier uniquement des annonces exactes et véridiques</li>
                <li>Respecter les rendez-vous convenus avec les étudiants</li>
                <li>Maintenir les logements dans un état décent</li>
                <li>Respecter les lois locales sur la location</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Étudiants</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Utiliser la plateforme de manière respectueuse</li>
                <li>Respecter les rendez-vous convenus</li>
                <li>Fournir des informations exactes dans vos recherches</li>
                <li>Respecter la vie privée des autres utilisateurs</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Contenu et publications</h2>
              <p className="text-gray-700 mb-4">
                Vous êtes responsable de tout contenu que vous publiez sur la plateforme. Vous acceptez de ne pas publier :
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Du contenu illégal, offensant ou discriminatoire</li>
                <li>Des informations fausses ou trompeuses</li>
                <li>Du contenu protégé par des droits d'auteur sans autorisation</li>
                <li>Des images inappropriées ou non pertinentes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Transactions et paiements</h2>
              <p className="text-gray-700 mb-4">
                ColocAntananarivo n'intervient pas dans les transactions financières entre propriétaires et étudiants. 
                Tous les accords financiers sont conclus directement entre les parties concernées.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitation de responsabilité</h2>
              <p className="text-gray-700 mb-4">
                ColocAntananarivo agit uniquement comme une plateforme de mise en relation. Nous ne garantissons pas :
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>L'exactitude des informations publiées par les utilisateurs</li>
                <li>La disponibilité ou la qualité des logements</li>
                <li>Le succès des transactions entre utilisateurs</li>
                <li>La résolution des litiges entre parties</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Suspension et résiliation</h2>
              <p className="text-gray-700 mb-4">
                Nous nous réservons le droit de suspendre ou de résilier votre compte en cas de :
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Violation de ces conditions d'utilisation</li>
                <li>Comportement frauduleux ou abusif</li>
                <li>Publication de contenu inapproprié</li>
                <li>Non-respect des lois applicables</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Modifications des conditions</h2>
              <p className="text-gray-700 mb-4">
                Nous nous réservons le droit de modifier ces conditions d'utilisation à tout moment. 
                Les modifications seront publiées sur cette page avec une date de mise à jour.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact</h2>
              <p className="text-gray-700 mb-4">
                Pour toute question concernant ces conditions d'utilisation, veuillez nous contacter via la page de contact.
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

export default TermsPage;

