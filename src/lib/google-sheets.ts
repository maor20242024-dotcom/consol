import { google } from "googleapis";
import { env } from "@/lib/env";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

export async function getGoogleSheetsClient() {
    if (!env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !env.GOOGLE_PRIVATE_KEY) {
        throw new Error("Google Service Account credentials are missing.");
    }

    // Handle newlines in private key if passed via env var
    const privateKey = env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");

    const auth = new google.auth.JWT({
        email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: privateKey,
        scopes: SCOPES,
    });
    return google.sheets({ version: "v4", auth });
}

export async function readSheet(spreadsheetId: string, range: string) {
    const sheets = await getGoogleSheetsClient();
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
    });
    return response.data.values;
}

export async function appendToSheet(spreadsheetId: string, range: string, values: string[][]) {
    const sheets = await getGoogleSheetsClient();
    const response = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: "USER_ENTERED",
        requestBody: {
            values,
        },
    });
    return response.data;
}
