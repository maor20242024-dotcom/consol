import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

// POST: Upload Ad Asset
export async function POST(req: NextRequest) {
    try {
        const user = await requireAuth(req);
        if (!user || !user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Storage implementation pending migration
        console.warn("[UPLOAD] File upload is currently disabled.");

        return NextResponse.json({
            success: false,
            message: "Storage implementation pending migration."
        }, { status: 501 });

        /* 
        // Original logic would be:
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const adId = formData.get("adId") as string;
        const assetType = formData.get("type") as string;
        
        // ... Upload to S3/Cloudinary/etc ...
        
        // ... Create AdAsset in Prisma ...
        */

    } catch (error: any) {
        console.error("Error uploading asset:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
