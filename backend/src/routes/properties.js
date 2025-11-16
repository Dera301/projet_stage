const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { sendResponse, sendError } = require('../utils/response');
const { verifyJWT } = require('../utils/auth');
const { sendAdminNotification } = require('../utils/adminNotifier');

const prisma = new PrismaClient();

// Get all properties
router.get('/get_all', async (req, res) => {
  try {
    const properties = await prisma.property.findMany({
      where: {
        isAvailable: true
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            isVerified: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Parse JSON fields
    const formattedProperties = properties.map(property => ({
      ...property,
      id: property.id.toString(),
      ownerId: property.ownerId.toString(),
      price: parseFloat(property.price),
      deposit: parseFloat(property.deposit),
      latitude: property.latitude ? parseFloat(property.latitude) : null,
      longitude: property.longitude ? parseFloat(property.longitude) : null,
      images: property.images ? JSON.parse(property.images) : [],
      amenities: property.amenities ? JSON.parse(property.amenities) : [],
      owner: {
        ...property.owner,
        id: property.owner.id.toString()
      },
      createdAt: property.createdAt.toISOString(),
      updatedAt: property.updatedAt.toISOString()
    }));

    return sendResponse(res, formattedProperties);
  } catch (error) {
    console.error('Get all properties error:', error);
    return sendError(res, 'Erreur lors de la récupération des propriétés: ' + error.message, 500);
  }
});

// Get property by ID
router.get('/get_by_id/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            isVerified: true
          }
        }
      }
    });

    if (!property) {
      return sendError(res, 'Propriété non trouvée', 404);
    }

    const formattedProperty = {
      ...property,
      id: property.id.toString(),
      ownerId: property.ownerId.toString(),
      price: parseFloat(property.price),
      deposit: parseFloat(property.deposit),
      latitude: property.latitude ? parseFloat(property.latitude) : null,
      longitude: property.longitude ? parseFloat(property.longitude) : null,
      images: property.images ? JSON.parse(property.images) : [],
      amenities: property.amenities ? JSON.parse(property.amenities) : [],
      owner: {
        ...property.owner,
        id: property.owner.id.toString()
      },
      createdAt: property.createdAt.toISOString(),
      updatedAt: property.updatedAt.toISOString()
    };

    return sendResponse(res, formattedProperty);
  } catch (error) {
    console.error('Get property by ID error:', error);
    return sendError(res, 'Erreur lors de la récupération de la propriété: ' + error.message, 500);
  }
});

// Get properties by user
router.get('/get_by_user', verifyJWT, async (req, res) => {
  try {
    const userId = req.user.id;

    const properties = await prisma.property.findMany({
      where: {
        ownerId: userId
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            isVerified: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedProperties = properties.map(property => ({
      ...property,
      id: property.id.toString(),
      ownerId: property.ownerId.toString(),
      price: parseFloat(property.price),
      deposit: parseFloat(property.deposit),
      latitude: property.latitude ? parseFloat(property.latitude) : null,
      longitude: property.longitude ? parseFloat(property.longitude) : null,
      images: property.images ? JSON.parse(property.images) : [],
      amenities: property.amenities ? JSON.parse(property.amenities) : [],
      owner: {
        ...property.owner,
        id: property.owner.id.toString()
      },
      createdAt: property.createdAt.toISOString(),
      updatedAt: property.updatedAt.toISOString()
    }));

    return sendResponse(res, formattedProperties);
  } catch (error) {
    console.error('Get properties by user error:', error);
    return sendError(res, 'Erreur lors de la récupération des propriétés: ' + error.message, 500);
  }
});

// Search properties
router.get('/search', async (req, res) => {
  try {
    const { district, propertyType, minPrice, maxPrice, availableRooms, amenities, sort } = req.query;

    const where = {
      isAvailable: true
    };

    if (district) {
      where.district = district;
    }

    if (propertyType) {
      where.propertyType = propertyType;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) {
        where.price.gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        where.price.lte = parseFloat(maxPrice);
      }
    }

    if (availableRooms) {
      where.availableRooms = {
        gte: parseInt(availableRooms)
      };
    }

    const orderBy = {};
    if (sort === 'price_asc') {
      orderBy.price = 'asc';
    } else if (sort === 'price_desc') {
      orderBy.price = 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const properties = await prisma.property.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            isVerified: true
          }
        }
      },
      orderBy
    });

    // Filter by amenities if provided
    let filteredProperties = properties;
    if (amenities) {
      const amenityArray = Array.isArray(amenities) ? amenities : [amenities];
      filteredProperties = properties.filter(property => {
        const propertyAmenities = property.amenities ? JSON.parse(property.amenities) : [];
        return amenityArray.every(amenity => propertyAmenities.includes(amenity));
      });
    }

    const formattedProperties = filteredProperties.map(property => ({
      ...property,
      id: property.id.toString(),
      ownerId: property.ownerId.toString(),
      price: parseFloat(property.price),
      deposit: parseFloat(property.deposit),
      latitude: property.latitude ? parseFloat(property.latitude) : null,
      longitude: property.longitude ? parseFloat(property.longitude) : null,
      images: property.images ? JSON.parse(property.images) : [],
      amenities: property.amenities ? JSON.parse(property.amenities) : [],
      owner: {
        ...property.owner,
        id: property.owner.id.toString()
      },
      createdAt: property.createdAt.toISOString(),
      updatedAt: property.updatedAt.toISOString()
    }));

    return sendResponse(res, formattedProperties);
  } catch (error) {
    console.error('Search properties error:', error);
    return sendError(res, 'Erreur lors de la recherche: ' + error.message, 500);
  }
});

// Create property
router.post('/create', verifyJWT, async (req, res) => {
  try {
    const {
      title,
      description,
      address,
      district,
      price,
      deposit,
      availableRooms,
      totalRooms,
      propertyType,
      amenities,
      images,
      latitude,
      longitude
    } = req.body;

    // Validate required fields
    if (!title || !description || !address || !district || !price || !deposit || !availableRooms || !totalRooms || !propertyType) {
      return sendError(res, 'Tous les champs requis doivent être remplis', 400);
    }

    // Verify user is owner
    if (req.user.userType !== 'owner') {
      return sendError(res, 'Seuls les propriétaires peuvent créer des propriétés', 403);
    }

    const property = await prisma.property.create({
      data: {
        title,
        description,
        address,
        district,
        price: parseFloat(price),
        deposit: parseFloat(deposit),
        availableRooms: parseInt(availableRooms),
        totalRooms: parseInt(totalRooms),
        propertyType,
        amenities: amenities ? JSON.stringify(amenities) : null,
        images: images ? JSON.stringify(images) : null,
        ownerId: req.user.id,
        isAvailable: true,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            isVerified: true
          }
        }
      }
    });

    const formattedProperty = {
      ...property,
      id: property.id.toString(),
      ownerId: property.ownerId.toString(),
      price: parseFloat(property.price),
      deposit: parseFloat(property.deposit),
      latitude: property.latitude ? parseFloat(property.latitude) : null,
      longitude: property.longitude ? parseFloat(property.longitude) : null,
      images: property.images ? JSON.parse(property.images) : [],
      amenities: property.amenities ? JSON.parse(property.amenities) : [],
      owner: {
        ...property.owner,
        id: property.owner.id.toString()
      },
      createdAt: property.createdAt.toISOString(),
      updatedAt: property.updatedAt.toISOString()
    };
    await sendAdminNotification('property_created', { id: property.id, ownerEmail: property.owner?.email, ownerName: `${property.owner?.firstName || ''} ${property.owner?.lastName || ''}`, title: property.title }).catch(() => {});
    return sendResponse(res, formattedProperty, 'Logement créé avec succès', 201);
  } catch (error) {
    console.error('Create property error:', error);
    return sendError(res, 'Erreur lors de la création du logement: ' + error.message, 500);
  }
});

// Update property
router.put('/update/:id', verifyJWT, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updateData = req.body;

    // Check if property exists and user is owner
    const property = await prisma.property.findUnique({
      where: { id }
    });

    if (!property) {
      return sendError(res, 'Propriété non trouvée', 404);
    }

    if (property.ownerId !== req.user.id && req.user.userType !== 'admin') {
      return sendError(res, 'Vous n\'êtes pas autorisé à modifier cette propriété', 403);
    }

    // Prepare update data
    const data = {};
    if (updateData.title) data.title = updateData.title;
    if (updateData.description) data.description = updateData.description;
    if (updateData.address) data.address = updateData.address;
    if (updateData.district) data.district = updateData.district;
    if (updateData.price) data.price = parseFloat(updateData.price);
    if (updateData.deposit) data.deposit = parseFloat(updateData.deposit);
    if (updateData.availableRooms) data.availableRooms = parseInt(updateData.availableRooms);
    if (updateData.totalRooms) data.totalRooms = parseInt(updateData.totalRooms);
    if (updateData.propertyType) data.propertyType = updateData.propertyType;
    if (updateData.amenities) data.amenities = JSON.stringify(updateData.amenities);
    if (updateData.images) data.images = JSON.stringify(updateData.images);
    if (updateData.latitude !== undefined) data.latitude = updateData.latitude ? parseFloat(updateData.latitude) : null;
    if (updateData.longitude !== undefined) data.longitude = updateData.longitude ? parseFloat(updateData.longitude) : null;
    if (updateData.isAvailable !== undefined) data.isAvailable = updateData.isAvailable;

    const updatedProperty = await prisma.property.update({
      where: { id },
      data,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            isVerified: true
          }
        }
      }
    });

    const formattedProperty = {
      ...updatedProperty,
      id: updatedProperty.id.toString(),
      ownerId: updatedProperty.ownerId.toString(),
      price: parseFloat(updatedProperty.price),
      deposit: parseFloat(updatedProperty.deposit),
      latitude: updatedProperty.latitude ? parseFloat(updatedProperty.latitude) : null,
      longitude: updatedProperty.longitude ? parseFloat(updatedProperty.longitude) : null,
      images: updatedProperty.images ? JSON.parse(updatedProperty.images) : [],
      amenities: updatedProperty.amenities ? JSON.parse(updatedProperty.amenities) : [],
      owner: {
        ...updatedProperty.owner,
        id: updatedProperty.owner.id.toString()
      },
      createdAt: updatedProperty.createdAt.toISOString(),
      updatedAt: updatedProperty.updatedAt.toISOString()
    };

    await sendAdminNotification('property_updated', { id: updatedProperty.id, ownerEmail: updatedProperty.owner?.email, ownerName: `${updatedProperty.owner?.firstName || ''} ${updatedProperty.owner?.lastName || ''}`, title: updatedProperty.title }).catch(() => {});
    return sendResponse(res, formattedProperty, 'Propriété mise à jour avec succès');
  } catch (error) {
    console.error('Update property error:', error);
    return sendError(res, 'Erreur lors de la mise à jour: ' + error.message, 500);
  }
});

// Delete property
router.delete('/delete/:id', verifyJWT, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true } }
      }
    });

    if (!property) {
      return sendError(res, 'Propriété non trouvée', 404);
    }

    if (property.ownerId !== req.user.id && req.user.userType !== 'admin') {
      return sendError(res, 'Vous n\'êtes pas autorisé à supprimer cette propriété', 403);
    }

    await prisma.property.delete({
      where: { id }
    });
    await sendAdminNotification('property_deleted', { id, title: property.title, ownerEmail: property.owner?.email, ownerName: `${property.owner?.firstName || ''} ${property.owner?.lastName || ''}` }).catch(() => {});
    return sendResponse(res, null, 'Propriété supprimée avec succès');
  } catch (error) {
    console.error('Delete property error:', error);
    return sendError(res, 'Erreur lors de la suppression: ' + error.message, 500);
  }
});

// Get property stats
router.get('/stats', verifyJWT, async (req, res) => {
  try {
    if (req.user.userType !== 'admin') {
      return sendError(res, 'Accès refusé', 403);
    }

    const totalProperties = await prisma.property.count();
    const availableProperties = await prisma.property.count({
      where: { isAvailable: true }
    });
    const totalOwners = await prisma.user.count({
      where: { userType: 'owner' }
    });

    return sendResponse(res, {
      totalProperties,
      availableProperties,
      unavailableProperties: totalProperties - availableProperties,
      totalOwners
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return sendError(res, 'Erreur lors de la récupération des statistiques: ' + error.message, 500);
  }
});

// Get public stats
router.get('/stats_public', async (req, res) => {
  try {
    const availableProperties = await prisma.property.count({ where: { isAvailable: true } });
    const totalOwners = await prisma.user.count({ where: { userType: 'owner' } });
    const totalStudents = await prisma.user.count({ where: { userType: 'student' } });

    return sendResponse(res, {
      availableProperties,
      totalOwners,
      totalStudents
    });
  } catch (error) {
    console.error('Get public stats error:', error);
    return sendError(res, 'Erreur lors de la récupération des statistiques: ' + error.message, 500);
  }
});

module.exports = router;

