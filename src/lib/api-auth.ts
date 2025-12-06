import { cookies } from "next/headers";
import { createServerClient } from '@supabase/ssr';
import { NextRequest } from "next/server";
import { prisma } from './db';

type AuthUser = {
  id: string;
  email?: string | null;
  userId?: string;
  role?: string; // "user" | "admin"
};

interface AuthOptions {
  allowAnonymous?: boolean;
  requiredRole?: string; // "admin" | "user"
}

export async function requireAuth(req?: NextRequest, options?: AuthOptions): Promise<AuthUser> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookies().getAll();
        },
        setAll() {},
      },
    }
  );
  const { data, error } = await supabase.auth.getUser();

  // مستخدم حقيقي
  if (!error && data?.user) {
    const authUser: AuthUser = { 
      id: data.user.id, 
      email: data.user.email, 
      userId: data.user.id 
    };
    
    // Fetch user role from database
    try {
      const user = await prisma.user.findUnique({
        where: { id: data.user.id },
        select: { role: true }
      });
      
      authUser.role = user?.role || 'user';
    } catch (dbError) {
      console.warn('[API AUTH] Failed to fetch user role:', dbError);
      authUser.role = 'user'; // Default fallback
    }
    
    // Check role requirements
    if (options?.requiredRole && authUser.role !== options.requiredRole) {
      throw new Error(`Insufficient privileges - ${options.requiredRole} role required`);
    }
    
    // Handle anonymous access if allowed
    if (options?.allowAnonymous && !authUser.id) {
      return { id: "anonymous", email: null, userId: "anonymous", role: "user" };
    }
    
    return authUser;
  }

  // Handle anonymous access
  if (options?.allowAnonymous) {
    return { id: "anonymous", email: null, userId: "anonymous" };
  }

  // وضع التطوير - مستخدم وهمي
  if (process.env.NODE_ENV === "development") {
    console.warn(
      "[requireAuth] Using DEV FAKE USER (development only)."
    );

    return {
      id: "dev-user-id",
      email: "dev@imperiumgate.local",
      userId: "dev-user-id",
    };
  }

  // الإنتاج
  throw new Error("Unauthorized - No session found");
}

/**
 * Middleware for API authentication (legacy version)
 * Validates user session and returns user info
 */
export async function requireAuthWithReq(req: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll() {},
      },
    }
  );

  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error('[API AUTH ERROR]', error);
    throw new Error('Authentication failed');
  }

  if (!session) {
    throw new Error('Unauthorized - No session found');
  }

  return {
    session,
    userId: session.user.id,
    email: session.user.email,
    user: session.user
  };
}

/**
 * Checks if user has admin privileges
 */
export async function requireAdminAuth(req: NextRequest) {
  const auth = await requireAuthWithReq(req);
  
  // For now, check if user email contains admin domain or specific pattern
  // TODO: Implement proper role-based access control
  const isAdmin = auth.email?.includes('admin') || auth.email?.includes('imperiumgate');
  
  if (!isAdmin) {
    throw new Error('Insufficient privileges - Admin access required');
  }
  
  return auth;
}

/**
 * Optional auth - returns user info if available, null otherwise
 */
export async function optionalAuth(req: NextRequest) {
  try {
    return await requireAuthWithReq(req);
  } catch (error) {
    return null;
  }
}
