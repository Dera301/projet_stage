import React from 'react';
import HeroBackground3D from '../components/HeroBackground3D';
import { 
  HeartIcon, 
  UsersIcon, 
  HomeIcon, 
  ShieldCheckIcon,
  MapPinIcon,
  AcademicCapIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const AboutPage: React.FC = () => {
  const team = [
    {
      name: 'Jean Dupont',
      role: 'Fondateur & CEO',
      description: 'Passionné par l\'innovation sociale et les solutions technologiques pour améliorer la vie des étudiants.',
      image: '/api/placeholder/200/200'
    },
    {
      name: 'Marie Rakoto',
      role: 'Responsable Technique',
      description: 'Développeuse expérimentée avec une expertise en React et Node.js.',
      image: '/api/placeholder/200/200'
    },
    {
      name: 'Sofia Andriamalala',
      role: 'Responsable Marketing',
      description: 'Spécialiste du marketing digital et de la communication auprès des étudiants.',
      image: '/api/placeholder/200/200'
    }
  ];

  const values = [
    {
      icon: <HeartIcon className="w-8 h-8 text-primary-600" />,
      title: 'Solidarité',
      description: 'Nous croyons en la force de la communauté étudiante et favorisons l\'entraide.'
    },
    {
      icon: <ShieldCheckIcon className="w-8 h-8 text-primary-600" />,
      title: 'Sécurité',
      description: 'La sécurité de nos utilisateurs est notre priorité absolue.'
    },
    {
      icon: <UsersIcon className="w-8 h-8 text-primary-600" />,
      title: 'Inclusion',
      description: 'Nous accueillons tous les étudiants, quelle que soit leur origine ou leur situation.'
    },
    {
      icon: <HomeIcon className="w-8 h-8 text-primary-600" />,
      title: 'Qualité',
      description: 'Nous nous engageons à offrir des logements de qualité à des prix abordables.'
    }
  ];

  const stats = [
    { number: '500+', label: 'Logements disponibles' },
    { number: '1200+', label: 'Étudiants inscrits' },
    { number: '300+', label: 'Colocations réussies' },
    { number: '15', label: 'Quartiers couverts' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-70 pointer-events-none">
          <HeroBackground3D />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              À propos de ColocAntananarivo
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              La plateforme de référence pour la colocation étudiante à Antananarivo, 
              créée par des étudiants, pour les étudiants.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Notre mission
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Faciliter l'accès au logement étudiant à Antananarivo en créant une communauté 
              solidaire et sécurisée pour la colocation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Un problème réel
              </h3>
              <p className="text-gray-600 mb-6">
                À Antananarivo, les étudiants font face à des difficultés majeures pour trouver 
                un logement abordable et adapté à leurs besoins. Les loyers élevés, le manque 
                d'information et l'absence de plateforme dédiée compliquent leur recherche.
              </p>
              <p className="text-gray-600">
                La colocation émerge comme une solution économique et conviviale, mais 
                l'absence d'outils adaptés rend la mise en relation entre étudiants et 
                propriétaires difficile.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-8">
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-primary-600 mb-2">
                      {stat.number}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nos valeurs
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Les principes qui guident notre action au quotidien
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comment ça marche
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Un processus simple et sécurisé en 3 étapes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Inscription
              </h3>
              <p className="text-gray-600">
                Créez votre profil en quelques minutes. Indiquez vos préférences 
                et votre budget pour une recherche personnalisée.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Recherche
              </h3>
              <p className="text-gray-600">
                Utilisez nos filtres avancés pour trouver des logements qui 
                correspondent à vos critères et à votre budget.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Mise en relation
              </h3>
              <p className="text-gray-600">
                Contactez les propriétaires via notre messagerie sécurisée 
                et planifiez vos visites en toute confiance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Notre équipe
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Des passionnés qui travaillent chaque jour pour améliorer 
              la vie des étudiants à Antananarivo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-600">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-primary-600 font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600 text-sm">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Notre impact
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Des résultats concrets qui améliorent la vie des étudiants
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">40%</h3>
              <p className="text-gray-600">d'économies en moyenne sur le loyer</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">95%</h3>
              <p className="text-gray-600">de satisfaction des utilisateurs</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPinIcon className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">15</h3>
              <p className="text-gray-600">quartiers couverts à Antananarivo</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AcademicCapIcon className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">8</h3>
              <p className="text-gray-600">universités partenaires</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Rejoignez notre communauté
          </h2>
          <p className="text-xl mb-8 text-primary-100 max-w-2xl mx-auto">
            Que vous soyez étudiant à la recherche d'un logement ou propriétaire 
            souhaitant louer, ColocAntananarivo est fait pour vous.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Commencer maintenant
            </a>
            <a
              href="/contact"
              className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Nous contacter
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
