'use server';

import { prisma } from '@/lib/prisma';

/**
 * Get leaderboard for an organization
 */
export async function getOrganizationLeaderboard(organizationId: string) {
  try {
    const users = await prisma.user.findMany({
      where: {
        organizationId,
      },
      orderBy: {
        rating: 'desc',
      },
      include: {
        organization: true,
      },
    });
    
    return users;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}

/**
 * Get global leaderboard (all users in the database)
 */
export async function getGlobalLeaderboard() {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        rating: 'desc',
      },
      include: {
        organization: true,
      },
    });
    return users;
  } catch (error) {
    console.error('Error fetching global leaderboard:', error);
    return [];
  }
}

/**
 * Get all organizations with member counts for leaderboard navigation
 */
export async function getOrganizationsForLeaderboard() {
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