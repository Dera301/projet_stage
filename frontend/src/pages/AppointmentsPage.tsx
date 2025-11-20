import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiGet, apiJson } from '../config';
import { 
  CalendarIcon, 
  CheckIcon, 
  XMarkIcon, 
  PencilIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { TrashIcon } from '@heroicons/react/24/solid'; // Changé de outline à solid
import toast from 'react-hot-toast';
import ScheduleAppointmentModal from '../components/ScheduleAppointmentModal';

interface Appointment {
  id: string;
  propertyId: string;
  propertyTitle: string;
  appointmentDate: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  message: string;
  studentFirstName?: string;
  studentLastName?: string;
  studentEmail?: string;
  studentPhone?: string;
  ownerFirstName?: string;
  ownerLastName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  address?: string;
  ownerId?: string; // Ajout de ownerId optionnel
}

const AppointmentsPage: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadAppointments();
    }
  }, [user]);

  const loadAppointments = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await apiGet('/api/appointments/get_all');
      
      if (data.success) {
        const items = (data.data || []) as Appointment[];
        // Exclure les rendez-vous annulés de l'affichage
        setAppointments(items.filter(a => a.status !== 'cancelled'));
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des rendez-vous');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const data = await apiJson(`/api/appointments/update_status/${id}`, 'PUT', { status });
      
      if (data.success) {
        toast.success('Statut mis à jour');
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: status as any } : a));
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const deleteAppointment = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      return;
    }

    try {
      // Note: Les rendez-vous ne sont pas supprimés, mais annulés via update_status
      const data = await apiJson(`/api/appointments/update_status/${id}`, 'PUT', { status: 'cancelled' });
      
      if (data.success) {
        toast.success('Rendez-vous annulé');
        // Retirer localement et assurer la cohérence après refresh
        setAppointments(prev => prev.filter(a => a.id !== id));
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setShowEditModal(true);
  };

  const handleUpdateAppointment = async (updatedData: any) => {
    try {
      // Utiliser update_status pour mettre à jour le rendez-vous
      const data = await apiJson(`/api/appointments/update_status/${editingAppointment?.id}`, 'PUT', {
        status: updatedData.status || editingAppointment?.status,
        message: updatedData.message || editingAppointment?.message
      });
      
      if (data.success) {
        toast.success('Rendez-vous modifié');
        setShowEditModal(false);
        setEditingAppointment(null);
        loadAppointments(); // Recharger la liste
      }
    } catch (error) {
      toast.error('Erreur lors de la modification');
    }
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Veuillez vous connecter</div>;
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'En attente',
      confirmed: 'Confirmé',
      cancelled: 'Annulé',
      completed: 'Terminé'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canEdit = (appointment: Appointment) => {
    const appointmentDate = new Date(appointment.appointmentDate);
    const now = new Date();
    const hoursDiff = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    // Permettre la modification seulement si le rendez-vous est dans plus de 2 heures
    return hoursDiff > 2 && appointment.status !== 'cancelled' && appointment.status !== 'completed';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Rendez-vous</h1>
          <p className="text-gray-600">
            {user.userType === 'student' 
              ? 'Gérez vos rendez-vous avec les propriétaires'
              : 'Gérez les rendez-vous pour vos propriétés'}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-center py-12">
            <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun rendez-vous</h3>
            <p className="text-gray-600">
              {user.userType === 'student'
                ? 'Vous n\'avez pas encore de rendez-vous planifié'
                : 'Aucun étudiant n\'a demandé de rendez-vous'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appointments.map(appointment => (
              <div key={appointment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Header avec statut */}
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(appointment.status)}`}>
                      {getStatusLabel(appointment.status)}
                    </span>
                    <div className="flex items-center space-x-1">
                      {canEdit(appointment) && (
                        <button
                          onClick={() => handleEdit(appointment)}
                          className="text-gray-400 hover:text-primary-600 transition-colors p-1"
                          title="Modifier"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteAppointment(appointment.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        title="Supprimer"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {appointment.propertyTitle}
                  </h3>
                  
                  {appointment.address && (
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <MapPinIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="truncate">{appointment.address}</span>
                    </div>
                  )}

                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <CalendarIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{formatDate(appointment.appointmentDate)}</span>
                  </div>

                  {/* Informations de contact */}
                  <div className="text-sm text-gray-600 space-y-1 mb-4">
                    {user.userType === 'owner' && (
                      <>
                        <p><strong>Étudiant:</strong> {appointment.studentFirstName} {appointment.studentLastName}</p>
                        <p><strong>Tél:</strong> {appointment.studentPhone}</p>
                      </>
                    )}
                    {user.userType === 'student' && (
                      <>
                        <p><strong>Propriétaire:</strong> {appointment.ownerFirstName} {appointment.ownerLastName}</p>
                        <p><strong>Tél:</strong> {appointment.ownerPhone}</p>
                      </>
                    )}
                  </div>

                  {appointment.message && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700 line-clamp-3">{appointment.message}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      {appointment.status === 'pending' && user.userType === 'owner' && (
                        <>
                          <button
                            onClick={() => updateStatus(appointment.id, 'confirmed')}
                            className="flex-1 btn-primary text-sm flex items-center justify-center space-x-1 py-2"
                          >
                            <CheckIcon className="w-4 h-4" />
                            <span>Confirmer</span>
                          </button>
                          <button
                            onClick={() => updateStatus(appointment.id, 'cancelled')}
                            className="flex-1 btn-secondary text-sm flex items-center justify-center space-x-1 py-2"
                          >
                            <XMarkIcon className="w-4 h-4" />
                            <span>Refuser</span>
                          </button>
                        </>
                      )}
                      {appointment.status === 'confirmed' && user.userType === 'student' && (
                        <button
                          onClick={() => updateStatus(appointment.id, 'cancelled')}
                          className="flex-1 btn-secondary text-sm flex items-center justify-center space-x-1 py-2"
                        >
                          <XMarkIcon className="w-4 h-4" />
                          <span>Annuler</span>
                        </button>
                      )}
                      {appointment.status === 'confirmed' && user.userType === 'owner' && (
                        <button
                          onClick={() => updateStatus(appointment.id, 'completed')}
                          className="flex-1 btn-primary text-sm flex items-center justify-center space-x-1 py-2"
                        >
                          <CheckIcon className="w-4 h-4" />
                          <span>Terminé</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de modification */}
      {editingAppointment && (
        <ScheduleAppointmentModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingAppointment(null);
          }}
          propertyId={editingAppointment.propertyId}
          ownerId={editingAppointment.ownerId || ''}
          propertyTitle={editingAppointment.propertyTitle}
          appointment={editingAppointment}
          onUpdate={handleUpdateAppointment}
        />
      )}
    </div>
  );
};

export default AppointmentsPage;