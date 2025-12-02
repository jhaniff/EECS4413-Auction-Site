import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { generateReceipt, type ReceiptResponse } from "../api/paymentAPI";
import "../styles/auctionStyles.css";

const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

const formatCurrency = (value?: number) => {
    if (typeof value !== 'number') return 'N/A';
    return currencyFormatter.format(value);
};

function ReceiptPage(){
     const { paymentId } = useParams<{ paymentId: string }>();
     const [receipt, setReceipt] = useState<ReceiptResponse | null>(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);

     useEffect(() => {
         if (!paymentId) {
            setError('Missing payment identifier.');
            setLoading(false);
            return;
         }
         let cancelled = false;

         const loadReceipt = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await generateReceipt(Number(paymentId));
                if (!cancelled) {
                    setReceipt(data);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : 'Unable to generate receipt.');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
         };

         loadReceipt();
         return () => {
            cancelled = true;
         };
     }, [paymentId]);

     if (loading) {
        return <div className="catalogue-loading">Preparing your receipt...</div>;
     }

     if (error) {
        return (
            <div className="catalogue-error">
                <p>{error}</p>
            </div>
        );
     }

     if (!receipt) {
        return <p className="info-line">Receipt data is unavailable.</p>;
     }

    return(
        <div className="receipt-layout">
            <div className="payment-section">
                <h2 className="section-heading">Winning Bidder</h2>
                <p className="info-line">First Name: {receipt.firstName}</p>
                <p className="info-line">Last Name: {receipt.lastName}</p>
                <p className="info-line">Street Name: {receipt.streetName}</p>
                <p className="info-line">Street Number: {receipt.streetNumber}</p>
                <p className="info-line">City: {receipt.city}</p>
                <p className="info-line">Country: {receipt.country}</p>
                <p className="info-line">Postal Code: {receipt.postalCode}</p>
                <p className="info-line">Total Paid: {formatCurrency(receipt.totalPaid)}</p>
            </div>

            <div className="payment-section">
                <h2 className="section-heading">Shipping Details</h2>
                <p className="info-line">Your order has been confirmed.</p>
                <p className="info-line">Delivery Date: {receipt.shippingDate ? new Date(receipt.shippingDate).toLocaleDateString() : 'Pending'}</p>
            </div>
        </div>
    );
}
export default ReceiptPage;