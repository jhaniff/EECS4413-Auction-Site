
export async function placePayment(paymentInfo){
    const URL = "https://localhost:8080/payment/place";
    const response = await fetch(URL, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(paymentInfo)
        });
    return response.json();
}
