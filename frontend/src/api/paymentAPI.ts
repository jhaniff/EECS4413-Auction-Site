import { API_BASE_URL } from './config';

const NORMALIZED_BASE = API_BASE_URL.replace(/\/+$/, '');

const buildHeaders = (): HeadersInit => {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

export interface PaymentRequestPayload {
    auctionID: number;
    paymentID?: number;
    cardNumber: string;
    nameOnCard: string;
    expiryDate: string;
    securityCode: string;
    expedited: boolean;
}

export interface PaymentResponse {
    paymentID?: number;
    firstName?: string;
    lastName?: string;
    deliveryDate?: string;
    message?: string;
    _links?: Record<string, unknown>;
}

export async function placePayment(
    payload: PaymentRequestPayload,
    signal?: AbortSignal,
): Promise<PaymentResponse> {
    const response = await fetch(`${NORMALIZED_BASE}/api/payment/place`, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify(payload),
        signal,
    });

    if (!response.ok) {
        throw new Error('Unable to submit payment right now. Please try again.');
    }

    return response.json() as Promise<PaymentResponse>;
}

export interface ReceiptResponse {
    firstName?: string;
    lastName?: string;
    streetName?: string;
    streetNumber?: string;
    city?: string;
    country?: string;
    postalCode?: string;
    totalPaid?: number;
    itemID?: number;
    shippingDate?: string;
    message?: string;
    _links?: Record<string, unknown>;
}

export async function generateReceipt(paymentID: number, signal?: AbortSignal): Promise<ReceiptResponse> {
    const response = await fetch(`${NORMALIZED_BASE}/api/payment/receipt`, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify({ paymentID }),
        signal,
    });

    if (!response.ok) {
        throw new Error('Unable to load receipt details right now.');
    }

    return response.json() as Promise<ReceiptResponse>;
}
