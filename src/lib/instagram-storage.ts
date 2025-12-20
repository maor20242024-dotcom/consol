/**
 * Assets Storage Stub
 * Placeholder for future storage implementation (e.g. AWS S3, Cloudflare R2)
 */

export async function uploadMetaAsset(file: File, path: string): Promise<string> {
    console.warn("Storage not implemented. File not uploaded:", path);
    return "";
}

export const uploadAdAsset = async (
    file: File,
    adId: string,
    assetType: 'image' | 'video'
) => {
    console.warn("Storage is currently disabled. File not uploaded:", file.name);
    return {
        success: false,
        error: "Storage backend is disabled",
        url: "",
        path: ""
    };
};

export const deleteAdAsset = async (path: string) => {
    console.warn("Storage is currently disabled.");
    return { success: true };
};
