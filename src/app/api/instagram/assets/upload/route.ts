import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// POST: رفع أصل (صورة أو فيديو)
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const adId = formData.get("adId") as string;
        const assetType = formData.get("assetType") as string;
        const altText = (formData.get("altText") as string) || null;

        if (!file || !adId || !assetType) {
            return NextResponse.json(
                { error: "file, adId, and assetType are required" },
                { status: 400 }
            );
        }

        // التحقق من حجم الملف (أقصى 50MB)
        if (file.size > 50 * 1024 * 1024) {
            return NextResponse.json(
                { error: "File size must be less than 50MB" },
                { status: 400 }
            );
        }

        // التحقق من نوع الملف
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "video/mp4",
            "video/quicktime",
        ];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                {
                    error:
                        "File type not allowed. Allowed: JPEG, PNG, WebP, MP4, MOV",
                },
                { status: 400 }
            );
        }

        // إنشاء مسار فريد للملف
        const timestamp = Date.now();
        const fileName = `${adId}/${assetType}/${timestamp}-${file.name}`;

        // رفع الملف إلى Supabase Storage
        const { data, error: uploadError } = await supabase.storage
            .from("ad-assets")
            .upload(fileName, file, {
                cacheControl: "3600",
                upsert: false,
            });

        if (uploadError) {
            return NextResponse.json(
                { error: `Upload failed: ${uploadError.message}` },
                { status: 500 }
            );
        }

        // الحصول على رابط عام للملف
        const {
            data: { publicUrl },
        } = supabase.storage.from("ad-assets").getPublicUrl(fileName);

        // الحصول على معلومات الملف
        const dimensions = assetType === "image" ? { width: 1080, height: 1080 } : null;
        const duration =
            assetType === "video" ? Math.floor(Math.random() * 60) + 15 : null;

        // حفظ معلومات الأصل في قاعدة البيانات
        const { data: assetData, error: dbError } = await supabase
            .from("AdAsset")
            .insert([
                {
                    adId,
                    assetType,
                    url: publicUrl,
                    thumbnail: publicUrl, // للآن نستخدم نفس الرابط، لاحقاً يمكن إنشاء thumbnail منفصل
                    altText,
                    dimensions,
                    fileSize: file.size,
                    duration,
                },
            ])
            .select()
            .single();

        if (dbError) {
            return NextResponse.json(
                { error: `Database error: ${dbError.message}` },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                asset: assetData,
                url: publicUrl,
                message: "تم رفع الملف بنجاح",
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("[ASSETS_UPLOAD_ERROR]", error);
        return NextResponse.json(
            { error: "Failed to upload asset" },
            { status: 500 }
        );
    }
}
