import crypto from 'crypto';
import axios from 'axios';
import { env } from '@/lib/env';

/**
 * Zadarma API Client Library
 * Handles all communications with Zadarma API (Calls, SMS, History, Balance)
 * Reference: docs/ZADARMAdocs.md
 */

const ZADARMA_API_KEY = env.ZADARMA_API_KEY;
const ZADARMA_API_SECRET = env.ZADARMA_API_SECRET;
const ZADARMA_API_URL = env.ZADARMA_API_URL || 'https://api.zadarma.com/v1';

if (!ZADARMA_API_KEY || !ZADARMA_API_SECRET) {
    console.warn('⚠️ ZADARMA_API_KEY or ZADARMA_API_SECRET is missing. Zadarma features will be disabled (Soft Fail).');
}

/**
 * Generate signature for Zadarma API request
 * Based on: https://zadarma.com/en/support/api/#auth
 */
export function generateSignature(method: string, params: Record<string, any> = {}): string {
    if (!ZADARMA_API_SECRET) {
        throw new Error('ZADARMA_API_SECRET is not configured');
    }

    // Sort parameters alphabetically
    const sortedParams = Object.keys(params)
        .sort()
        .reduce((obj: Record<string, any>, key) => {
            obj[key] = params[key];
            return obj;
        }, {});

    // Create params string
    const paramsStr = Object.keys(sortedParams).length > 0
        ? new URLSearchParams(sortedParams).toString()
        : '';

    // Create MD5 hash of params (empty string if no params)
    const paramsMd5 = paramsStr ? crypto.createHash('md5').update(paramsStr).digest('hex') : '';

    // Create signature string: method + params + md5(params)
    const signString = method + paramsStr + paramsMd5;

    // Generate HMAC-SHA1 signature
    const signature = crypto
        .createHmac('sha1', ZADARMA_API_SECRET)
        .update(signString)
        .digest('base64');

    return signature;
}

/**
 * Make authenticated request to Zadarma API
 */
async function zadarmaRequest(
    method: string,
    params: Record<string, any> = {},
    httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET'
): Promise<any> {
    if (!ZADARMA_API_KEY || !ZADARMA_API_SECRET) {
        console.warn('[Zadarma] Credentials missing, skipping request.');
        return { status: 'skipped', success: false, message: 'No credentials' };
    }

    const signature = generateSignature(method, params);
    const url = new URL(`${ZADARMA_API_URL}${method}`);

    // Add params to URL for GET requests
    if (httpMethod === 'GET' && Object.keys(params).length > 0) {
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    }

    const headers: Record<string, string> = {
        'Authorization': `${ZADARMA_API_KEY}:${signature}`,
        'Content-Type': 'application/x-www-form-urlencoded',
    };

    const options: RequestInit = {
        method: httpMethod,
        headers,
    };

    // Add body for POST/PUT requests
    if ((httpMethod === 'POST' || httpMethod === 'PUT') && Object.keys(params).length > 0) {
        options.body = new URLSearchParams(params).toString();
    }

    const response = await fetch(url.toString(), options);
    const data = await response.json();

    if (!response.ok || data.status !== 'success') {
        throw new Error(data.message || 'Zadarma API request failed');
    }

    return data;
}

/**
 * Make an outbound call
 * @param from - Your Zadarma number (e.g., "+971800IMPERIUM")
 * @param to - Destination number
 * @param sip - Optional SIP extension ID
 */
export async function makeCall(from: string, to: string, sip?: string) {
    const params: Record<string, any> = { from, to };
    if (sip) params.sip = sip;

    return zadarmaRequest('/request/callback/', params, 'GET');
}

/**
 * Get call history
 * @param start - Start date
 * @param end - End date
 * @param filters - Optional filters (sip, callType, etc.)
 */
export async function getCallHistory(
    start: Date,
    end: Date,
    filters?: { sip?: string; callType?: string }
) {
    const params: Record<string, any> = {
        start: start.toISOString().split('T')[0], // YYYY-MM-DD
        end: end.toISOString().split('T')[0],
    };

    if (filters?.sip) params.sip = filters.sip;
    if (filters?.callType) params.type = filters.callType;

    return zadarmaRequest('/statistics/', params, 'GET');
}

/**
 * Get account balance
 */
export async function getBalance() {
    return zadarmaRequest('/info/balance/', {}, 'GET');
}

/**
 * Send SMS
 * @param number - Destination phone number
 * @param message - SMS text (max 1000 characters)
 * @param sender - Optional sender name (max 11 characters)
 */
export async function sendSMS(number: string, message: string, sender?: string) {
    const params: Record<string, any> = { number, message };
    if (sender) params.caller_id = sender;

    return zadarmaRequest('/sms/send/', params, 'POST');
}

/**
 * Request call recording URL
 * @param callId - Call ID from Zadarma
 * @param pbxCallId - PBX Call ID (alternative to callId)
 */
export async function requestCallRecording(callId?: string, pbxCallId?: string) {
    const params: Record<string, any> = {};
    if (callId) params.call_id = callId;
    if (pbxCallId) params.pbx_call_id = pbxCallId;

    return zadarmaRequest('/record/request/', params, 'GET');
}

/**
 * Initiate speech recognition for a call
 * @param callId - Call ID or PBX Call ID
 * @param lang - Language code (e.g., 'en', 'ar')
 */
export async function initiateSpeechRecognition(callId: string, lang: string = 'en') {
    const params = { call_id: callId, language: lang };
    return zadarmaRequest('/speech/recognition/', params, 'POST');
}

/**
 * Get speech recognition results
 * @param callId - Call ID or PBX Call ID
 * @param lang - Language code
 * @param returnType - 'words' or 'phrases'
 */
export async function getSpeechRecognitionResults(
    callId: string,
    lang: string = 'en',
    returnType: 'words' | 'phrases' = 'phrases'
) {
    const params = { call_id: callId, language: lang, return_type: returnType };
    return zadarmaRequest('/speech/recognition/results/', params, 'GET');
}

/**
 * Get PBX internal numbers (extensions)
 */
export async function getPBXInternal() {
    return zadarmaRequest('/pbx/internal/', {}, 'GET');
}

/**
 * Zadarma Client - All-in-one export
 */
export const ZadarmaClient = {
    makeCall,
    getCallHistory,
    getBalance,
    sendSMS,
    requestCallRecording,
    initiateSpeechRecognition,
    getSpeechRecognitionResults,
    getPBXInternal,
    generateSignature,
};

export default ZadarmaClient;
