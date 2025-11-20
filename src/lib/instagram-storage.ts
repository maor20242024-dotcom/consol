import { supabase } from './supabase';

/**
 * تحميل ملف إلى Supabase Storage
 */
export const uploadAdAsset = async (
    file: File,
    adId: string,
    assetType: 'image' | 'video'
) => {
    try {
        const timestamp = Date.now();
        const fileName = `${adId}/${assetType}/${timestamp}-${file.name}`;

        // رفع الملف
        const { data, error } = await supabase.storage
            .from('ad-assets')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (error) {
            throw new Error(error.message);
        }

        // الحصول على الرابط العام
        const { data: publicUrlData } = supabase.storage
            .from('ad-assets')
            .getPublicUrl(fileName);

        return {
            success: true,
            url: publicUrlData.publicUrl,
            path: fileName,
        };
    } catch (error) {
        console.error('Upload error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Upload failed',
        };
    }
};

/**
 * حذف ملف من Supabase Storage
 */
export const deleteAdAsset = async (path: string) => {
    try {
        const { error } = await supabase.storage
            .from('ad-assets')
            .remove([path]);

        if (error) {
            throw new Error(error.message);
        }

        return { success: true };
    } catch (error) {
        console.error('Delete error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Delete failed',
        };
    }
};

/**
 * الحصول على الرابط العام للملف
 */
export const getPublicUrl = (path: string) => {
    const { data } = supabase.storage
        .from('ad-assets')
        .getPublicUrl(path);

    return data.publicUrl;
};

/**
 * قائمة الملفات في مجلد معين
 */
export const listAdAssets = async (adId: string) => {
    try {
        const { data, error } = await supabase.storage
            .from('ad-assets')
            .list(`${adId}`, {
                limit: 100,
                offset: 0,
                sortBy: { column: 'name', order: 'asc' },
            });

        if (error) {
            throw new Error(error.message);
        }

        return { success: true, files: data || [] };
    } catch (error) {
        console.error('List error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'List failed',
        };
    }
};
