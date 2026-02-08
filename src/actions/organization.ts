'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Get all organizations
 */
export async function getAllOrganizations() {
  try {
    const organizations = await prisma.organization.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });
    
    return organizations;
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return [];
  }
}

/**
 * Get organization by ID
 */
export async function getOrganizationById(id: string) {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        members: {
          orderBy: { rating: 'desc' },
        },
        _count: {
          select: { members: true, events: true },
        },
      },
    });
    
    return organization;
  } catch (error) {
    console.error('Error fetching organization:', error);
    return null;
  }
}

/**
 * Create a new organization
 */
export async function createOrganization(data: {
  name: string;
  type: 'Club' | 'College';
  location: string;
}) {
  try {
    const organization = await prisma.organization.create({
      data: {
        name: data.name,
        type: data.type,
        location: data.location,
      },
    });
    
    // Don't revalidate here - it causes the form to reset
    // The component will handle updating its local state
    return { success: true, organization };
  } catch (error) {
    console.error('Error creating organization:', error);
    return { success: false, error: 'Failed to create organization' };
  }
}

/**
 * Search organizations by name
 */
export async function searchOrganizations(query: string) {
  if (!query || query.length < 2) {
    return [];
  }
  
  try {
    const organizations = await prisma.organization.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      take: 10,
      include: {
        _count: {
          select: { members: true },
        },
      },
    });
    
    return organizations;
  } catch (error) {
    console.error('Error searching organizations:', error);
    return [];
  }
}
