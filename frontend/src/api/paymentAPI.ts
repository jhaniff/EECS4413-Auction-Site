
export async function placePayment(paymentInfo){
    const URL = "http://localhost:8080/payment/place";
    const response = await fetch(URL, {
        method: "POST",
        heads: {"Content-Type": "application/json"},
        body: JSON.stringify(paymentInfo)
        });
}
