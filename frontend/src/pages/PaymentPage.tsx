import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PaymentForm, { type PaymentFormValues } from "../components/PaymentForm";
import { fetchAuctionDetail, type AuctionDetail } from "../api/auctionApi";
import { placePayment } from "../api/paymentAPI";
import "../styles/auctionStyles.css";

const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

const formatCurrency = (value?: number) => {
    if (typeof value !== 'number') return 'N/A';
    return currencyFormatter.format(value);
};

function decodeJwtSubject(token: string | null) {
    if (!token) return null;
    try {
        const payload = token.split('.')[1];
        if (!payload) return null;
        const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
        const decodeBase64 = typeof globalThis.atob === 'function' ? globalThis.atob : null;
        if (!decodeBase64) return null;
        const decoded = decodeBase64(normalized);
        return JSON.parse(decoded)?.sub ?? null;
    } catch {
        return null;
    }
}
function PaymentPage(){
     const { id } = useParams<{ id: string }>();
     const auctionID = id ? Number(id) : null;
     const navigate = useNavigate();
     const [auction, setAuction] = useState<AuctionDetail | null>(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);
     const [submitting, setSubmitting] = useState(false);
     const [paymentError, setPaymentError] = useState<string | null>(null);
     const [signedInUser, setSignedInUser] = useState(() => decodeJwtSubject(localStorage.getItem('authToken')) ?? 'your account');

     useEffect(() => {
        setSignedInUser(decodeJwtSubject(localStorage.getItem('authToken')) ?? 'your account');
     }, []);

     useEffect(() => {
         if (!auctionID) {
            setError('Missing auction identifier.');
            setLoading(false);
            return;
         }
         const controller = new AbortController();
         setLoading(true);
         setError(null);

         fetchAuctionDetail(auctionID, controller.signal)
            .then(setAuction)
            .catch((err) => {
                if (!controller.signal.aborted) {
                    setError(err instanceof Error ? err.message : 'Unable to load auction details.');
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            });

         return () => controller.abort();
     }, [auctionID]);

     async function handlePayment(paymentInfo: PaymentFormValues){
           if (!auctionID) {
                setPaymentError('Missing auction identifier.');
                return;
           }
           setSubmitting(true);
           setPaymentError(null);

           const expiryDateISO = paymentInfo.expiryDate
                ? new Date(`${paymentInfo.expiryDate}-01T00:00:00Z`).toISOString()
                : new Date().toISOString();

           try {
                const response = await placePayment({
                    auctionID,
                    cardNumber: paymentInfo.cardNumber.trim(),
                    nameOnCard: paymentInfo.nameOnCard.trim(),
                    expiryDate: expiryDateISO,
                    securityCode: paymentInfo.securityCode.trim(),
                    expedited: paymentInfo.expeditedShipping
                });

                if(!response?.paymentID){
                    setPaymentError(response?.message ?? 'Payment could not be completed.');
                    return;
                }

                navigate(`/payment/${response.paymentID}/receipt`, { replace: true });
           } catch (err) {
                setPaymentError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
           } finally {
                setSubmitting(false);
           }
     }

     if (loading) {
        return <div className="catalogue-loading">Loading payment details...</div>;
     }

     if (error || !auction) {
        return (
            <div className="catalogue-error">
                <p>{error ?? 'Auction not found.'}</p>
            </div>
        );
     }

    return(
        <div className="payment-layout">
            <div className="payment-section">
                <h2 className="section-heading">Order Summary</h2>
                <p className="info-line">Item: {auction.itemName}</p>
                <p className="info-line">Current Price: {formatCurrency(auction.currentPrice)}</p>
                <p className="info-line">Highest Bidder: {auction.highestBidderName ?? 'No bids yet'}</p>
                <p className="info-line">Signed in as: {signedInUser}</p>
                <p className="info-line">Auction ends at: {auction.endsAt ? new Date(auction.endsAt).toLocaleString() : 'N/A'}</p>
                <p className="info-line">Remaining time: {auction.remainingTime ?? 'Unavailable'}</p>
            </div>

            <div className="payment-section">
                <h2 className="section-heading">Payment Method</h2>
                <p className="info-line">Your saved account address will be used for delivery after the auction closes.</p>
                {paymentError && (
                    <p className="info-line" style={{ color: '#f87171' }}>{paymentError}</p>
                )}
                <PaymentForm onSubmitPayment={handlePayment} submitting={submitting}/>
            </div>
        </div>
    );
}

export default PaymentPage;