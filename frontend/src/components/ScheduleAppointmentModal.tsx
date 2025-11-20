import React, { useState, useEffect } from 'react';
import { CalendarIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { apiJson, apiGet } from '../config';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

interface ScheduleAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  ownerId: string;
  propertyTitle: string;
  appointment?: any; // Pour l'édition
  onUpdate?: (data: any) => void; // Pour l'édition
}

const ScheduleAppointmentModal: React.FC<ScheduleAppointmentModalProps> = ({
  isOpen,
  onClose,
  propertyId,
  ownerId,
  propertyTitle,
  appointment,
  onUpdate
}) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingAppointments, setExistingAppointments] = useState<any[]>([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', 
    '14:00', '15:00', '16:00', '17:00'
  ];

  // Charger les rendez-vous existants pour vérifier les disponibilités
  useEffect(() => {

    const loadExistingAppointments = async () => {
    if (!user) return;
    
    setCheckingAvailability(true);
    try {
      const data = await apiGet('/api/appointments/get_all');
      
      if (data.success) {
        setExistingAppointments(data.data || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des rendez-vous existants');
    } finally {
      setCheckingAvailability(false);
    }
  };
    if (isOpen && user) {
      loadExistingAppointments();
    }
  }, [isOpen, user]);

  // Pré-remplir le formulaire en mode édition
  useEffect(() => {
    if (appointment) {
      const appointmentDate = new Date(appointment.appointmentDate);
      setSelectedDate(appointmentDate.toISOString().split('T')[0]);
      setSelectedTime(appointmentDate.toTimeString().slice(0, 5));
      setMessage(appointment.message);
    } else {
      setSelectedDate('');
      setSelectedTime('');
      setMessage('');
    }
  }, [appointment]);

  

  const isTimeSlotTaken = (date: string, time: string) => {
    const selectedDateTime = new Date(`${date}T${time}:00`);
    const now = new Date();
    
    return existingAppointments.some(apt => {
      if (apt.id === appointment?.id) return false; // Ignorer le rendez-vous en cours d'édition
      
      const aptDateTime = new Date(apt.appointmentDate);
      // Ignorer les rendez-vous passés
      if (aptDateTime.getTime() < now.getTime()) return false;
      // Ignorer les rendez-vous complétés
      if (apt.status === 'completed') return false;

      const timeDiff = Math.abs(selectedDateTime.getTime() - aptDateTime.getTime());
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      // Considérer comme pris si dans les 2 heures et non annulé
      return hoursDiff < 2 && apt.status !== 'cancelled';
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime) {
      toast.error('Veuillez sélectionner une date et une heure');
      return;
    }

    if (!user) {
      toast.error('Veuillez vous connecter pour planifier un rendez-vous');
      return;
    }

    // Vérifier si le créneau est déjà pris
    if (isTimeSlotTaken(selectedDate, selectedTime)) {
      toast.error('Ce créneau horaire est déjà réservé. Veuillez choisir un autre horaire.');
      return;
    }

    setLoading(true);
    try {
      const appointmentDateTime = `${selectedDate}T${selectedTime}:00`;
      
      if (appointment && onUpdate) {
        // Mode édition
        await onUpdate({
          appointmentDate: appointmentDateTime,
          message: message || `Je souhaite visiter le logement "${propertyTitle}"`
        });
      } else {
        // Mode création
        const data = await apiJson('/api/appointments/create', 'POST', {
          propertyId,
          appointmentDate: appointmentDateTime,
          message: message || `Je souhaite visiter le logement "${propertyTitle}"`
        });

        if (data.success) {
          toast.success('Rendez-vous planifié avec succès !');
          onClose();
        } else {
          toast.error(data.message || 'Erreur lors de la planification');
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la planification du rendez-vous');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Calcul de la date minimale (aujourd'hui) et maximale (dans 30 jours)
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {appointment ? 'Modifier la visite' : 'Planifier une visite'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logement
            </label>
            <p className="text-gray-900 font-medium">{propertyTitle}</p>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Date de visite *
            </label>
            <div className="relative">
              <CalendarIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="date"
                id="date"
                required
                min={today}
                max={maxDateStr}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Heure de visite *
            </label>
            {checkingAvailability ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {timeSlots.map((time) => {
                  const isTaken = selectedDate ? isTimeSlotTaken(selectedDate, time) : false;
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => !isTaken && setSelectedTime(time)}
                      disabled={isTaken}
                      className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                        selectedTime === time
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : isTaken
                          ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'border-gray-300 text-gray-700 hover:border-primary-400'
                      }`}
                      title={isTaken ? 'Créneau indisponible' : ''}
                    >
                      {time}
                      {isTaken && (
                        <div className="text-xs text-red-500 mt-1">Indisponible</div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Message au propriétaire (optionnel)
            </label>
            <textarea
              id="message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Bonjour, je souhaite visiter votre logement..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !selectedDate || !selectedTime || checkingAvailability}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading 
                ? (appointment ? 'Modification...' : 'Planification...') 
                : (appointment ? 'Modifier' : 'Confirmer')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleAppointmentModal;