export async function placeBid(auctionId, amount){
    const URL = "http://localhost:8080/auction/bid";

    const response = await fetch(URL, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(paymentInfo)
        });
    return response.json();
}