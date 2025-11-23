const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { sendResponse, sendError } = require('../utils/response');
const { verifyJWT } = require('../utils/auth');

const prisma = new PrismaClient();

// Create appointment
router.post('/create', verifyJWT, async (req, res) => {
  try {
    const { propertyId, appointmentDate, message } = req.body;
    const studentId = req.user.id;

    if (!propertyId || !appointmentDate) {
      return sendError(res, 'Propriété et date de rendez-vous requis', 400);
    }

    // Verify user is student
    if (req.user.userType !== 'student') {
      return sendError(res, 'Seuls les étudiants peuvent créer des rendez-vous', 403);
    }

    const propertyIdInt = parseInt(propertyId);

    // Get property and owner
    const property = await prisma.property.findUnique({
      where: { id: propertyIdInt },
      include: {
        owner: true
      }
    });

    if (!property) {
      return sendError(res, 'Propriété non trouvée', 404);
    }

    if (!property.isAvailable) {
      return sendError(res, 'Cette propriété n\'est plus disponible', 400);
    }

    // Check for conflicting appointments for the same owner within +/- 2 hours
    const requestedDate = new Date(appointmentDate);
    const windowStart = new Date(requestedDate.getTime() - 2 * 60 * 60 * 1000);
    const windowEnd = new Date(requestedDate.getTime() + 2 * 60 * 60 * 1000);

    const conflicting = await prisma.appointment.findFirst({
      where: {
        ownerId: property.ownerId,
        appointmentDate: {
          gte: windowStart,
          lte: windowEnd
        },
        NOT: {
          status: 'cancelled'
        }
      }
    });

    // If conflict, create appointment as cancelled with reason; else pending as usual
    const initialStatus = conflicting ? 'cancelled' : 'pending';
    const initialMessage = conflicting
      ? (message || `Créneau indisponible: un autre rendez-vous avec le propriétaire est planifié autour de cet horaire.`)
      : (message || null);

    const appointment = await prisma.appointment.create({
      data: {
        propertyId: propertyIdInt,
        studentId,
        ownerId: property.ownerId,
        appointmentDate: requestedDate,
        status: initialStatus,
        message: initialMessage
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            address: true
          }
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      }
    });

    const formattedAppointment = {
      id: appointment.id.toString(),
      propertyId: appointment.propertyId.toString(),
      studentId: appointment.studentId.toString(),
      ownerId: appointment.ownerId.toString(),
      appointmentDate: appointment.appointmentDate.toISOString(),
      status: appointment.status,
      message: appointment.message,
      propertyTitle: appointment.property.title,
      address: appointment.property.address,
      studentFirstName: appointment.student.firstName,
      studentLastName: appointment.student.lastName,
      studentEmail: appointment.student.email,
      studentPhone: appointment.student.phone,
      ownerFirstName: appointment.owner.firstName,
      ownerLastName: appointment.owner.lastName,
      ownerEmail: appointment.owner.email,
      ownerPhone: appointment.owner.phone,
      ownerId: appointment.ownerId.toString(),
      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString()
    };

    const creationMessage = conflicting
      ? 'Rendez-vous créé mais annulé: créneau en conflit'
      : 'Rendez-vous créé avec succès';
    return sendResponse(res, formattedAppointment, creationMessage, 201);
  } catch (error) {
    console.error('Create appointment error:', error);
    return sendError(res, 'Erreur lors de la création du rendez-vous: ' + error.message, 500);
  }
});

// Get all appointments
router.get('/get_all', verifyJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.userType;

    let appointments;

    if (userType === 'student') {
      appointments = await prisma.appointment.findMany({
        where: {
          studentId: userId
        },
        include: {
          property: {
            select: {
              id: true,
              title: true,
              address: true
            }
          },
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          }
        },
        orderBy: {
          appointmentDate: 'desc'
        }
      });
    } else if (userType === 'owner') {
      appointments = await prisma.appointment.findMany({
        where: {
          ownerId: userId
        },
        include: {
          property: {
            select: {
              id: true,
              title: true,
              address: true
            }
          },
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          }
        },
        orderBy: {
          appointmentDate: 'desc'
        }
      });
    } else {
      // Admin can see all
      appointments = await prisma.appointment.findMany({
        include: {
          property: {
            select: {
              id: true,
              title: true,
              address: true
            }
          },
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          }
        },
        orderBy: {
          appointmentDate: 'desc'
        }
      });
    }

    const formattedAppointments = appointments.map(appointment => ({
      id: appointment.id.toString(),
      propertyId: appointment.propertyId.toString(),
      studentId: appointment.studentId.toString(),
      ownerId: appointment.ownerId.toString(),
      appointmentDate: appointment.appointmentDate.toISOString(),
      status: appointment.status,
      message: appointment.message,
      propertyTitle: appointment.property.title,
      address: appointment.property.address,
      studentFirstName: appointment.student.firstName,
      studentLastName: appointment.student.lastName,
      studentEmail: appointment.student.email,
      studentPhone: appointment.student.phone,
      ownerFirstName: appointment.owner.firstName,
      ownerLastName: appointment.owner.lastName,
      ownerEmail: appointment.owner.email,
      ownerPhone: appointment.owner.phone,
      ownerId: appointment.ownerId.toString(),
      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString()
    }));

    return sendResponse(res, formattedAppointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    return sendError(res, 'Erreur lors de la récupération des rendez-vous: ' + error.message, 500);
  }
});

// Update appointment status
router.put('/update_status/:id', verifyJWT, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    if (!status || !['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return sendError(res, 'Statut invalide', 400);
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id }
    });

    if (!appointment) {
      return sendError(res, 'Rendez-vous non trouvé', 404);
    }

    // Verify user has permission
    // Owners (or admin) can update any allowed status
    // Students can only cancel their own appointments
    const isOwnerOrAdmin = (appointment.ownerId === req.user.id) || (req.user.userType === 'admin');
    const isStudentCancellingOwn = (status === 'cancelled' && appointment.studentId === req.user.id);

    if (!isOwnerOrAdmin && !isStudentCancellingOwn) {
      return sendError(res, 'Vous n\'êtes pas autorisé à modifier ce rendez-vous', 403);
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: { status },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            address: true
          }
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      }
    });

    const formattedAppointment = {
      id: updatedAppointment.id.toString(),
      propertyId: updatedAppointment.propertyId.toString(),
      studentId: updatedAppointment.studentId.toString(),
      ownerId: updatedAppointment.ownerId.toString(),
      appointmentDate: updatedAppointment.appointmentDate.toISOString(),
      status: updatedAppointment.status,
      message: updatedAppointment.message,
      propertyTitle: updatedAppointment.property.title,
      address: updatedAppointment.property.address,
      studentFirstName: updatedAppointment.student.firstName,
      studentLastName: updatedAppointment.student.lastName,
      studentEmail: updatedAppointment.student.email,
      studentPhone: updatedAppointment.student.phone,
      ownerFirstName: updatedAppointment.owner.firstName,
      ownerLastName: updatedAppointment.owner.lastName,
      ownerEmail: updatedAppointment.owner.email,
      ownerPhone: updatedAppointment.owner.phone,
      ownerId: updatedAppointment.ownerId.toString(),
      createdAt: updatedAppointment.createdAt.toISOString(),
      updatedAt: updatedAppointment.updatedAt.toISOString()
    };

    return sendResponse(res, formattedAppointment, 'Statut du rendez-vous mis à jour');
  } catch (error) {
    console.error('Update appointment status error:', error);
    return sendError(res, 'Erreur lors de la mise à jour: ' + error.message, 500);
  }
});

module.exports = router;

