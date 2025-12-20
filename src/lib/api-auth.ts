import { NextRequest } from "next/server";
import { prisma } from './db';
import { stackServerApp } from "@/lib/stack";
import { cookies } from "next/headers";

type AuthUser = {
  id: string;
  email?: string | null;
  userId?: string;
  role?: string; // "user" | "admin" | "superadmin"
};

interface AuthOptions {
  allowAnonymous?: boolean;
  requiredRole?: string; // "admin" | "user" | "superadmin"
}

export async function requireAuth(req?: NextRequest, options?: AuthOptions): Promise<AuthUser> {
  // 1. CRM API Key Bypass
  if (req) {
    const apiKeyHeader = req.headers.get('x-api-key');
    const authHeader = req.headers.get('authorization');
    const crmApiKey = process.env.IMPERIUM_CRM_API_KEY || process.env.CRM_API_KEY;

    let providedKey = apiKeyHeader;
    if (!providedKey && authHeader?.startsWith('Bearer ')) {
      providedKey = authHeader.split(' ')[1];
    }

    if (providedKey && crmApiKey && providedKey === crmApiKey) {
      return {
        id: 'crm-system',
        email: 'system@imperiumgate.com',
        userId: 'crm-system',
        role: 'superadmin'
      };
    }
  }

  // 2. Local Imperium Session (Custom Auth)
  const cookieStore = cookies();
  const localSessionId = cookieStore.get("imperium_session")?.value;

  if (localSessionId) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: localSessionId },
        select: { id: true, email: true, role: true }
      });

      if (dbUser) {
        const authUser: AuthUser = {
          id: dbUser.id,
          email: dbUser.email,
          userId: dbUser.id,
          role: dbUser.role
        };

        // Check Role Hierarchy
        if (options?.requiredRole) {
          const roles = ['user', 'admin', 'superadmin'];
          const userLevel = roles.indexOf(authUser.role || 'user');
          const requiredLevel = roles.indexOf(options.requiredRole);

          if (userLevel < requiredLevel) {
            throw new Error(`Insufficient privileges - ${options.requiredRole} role required`);
          }
        }

        return authUser;
      }
    } catch (e) {
      console.warn('[API AUTH] Local session verification failed');
    }
  }

  // 3. Fallback to Stack Auth
  const user = await stackServerApp.getUser();
  if (user) {
    const authUser: AuthUser = {
      id: user.id || "",
      email: user.primaryEmail,
      userId: user.id || ""
    };

    try {
      let dbUser = await prisma.user.findUnique({
        where: { id: user.id || "" },
        select: { id: true, role: true }
      });

      if (!dbUser && user.primaryEmail) {
        dbUser = await prisma.user.findUnique({
          where: { email: user.primaryEmail },
          select: { id: true, role: true }
        });

        if (dbUser) {
          await prisma.user.update({
            where: { email: user.primaryEmail },
            data: { id: user.id }
          });
        }
      }

      authUser.role = dbUser?.role || 'user';
    } catch (dbError) {
      authUser.role = 'user';
    }

    if (options?.requiredRole) {
      const roles = ['user', 'admin', 'superadmin'];
      const userLevel = roles.indexOf(authUser.role || 'user');
      const requiredLevel = roles.indexOf(options.requiredRole);

      if (userLevel < requiredLevel) {
        throw new Error(`Insufficient privileges - ${options.requiredRole} role required`);
      }
    }

    return authUser;
  }

  if (options?.allowAnonymous) {
    return { id: "anonymous", email: null, userId: "anonymous" };
  }

  throw new Error("Unauthorized - Access Denied");
}

export async function requireAdminAuth(req: NextRequest) {
  return await requireAuth(req, { requiredRole: 'admin' });
}

export async function requireSuperAdminAuth(req: NextRequest) {
  return await requireAuth(req, { requiredRole: 'superadmin' });
}
