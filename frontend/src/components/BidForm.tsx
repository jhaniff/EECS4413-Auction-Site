function BidForm() {
  return (
    <form>
      <label>Bid Amount:
        <input type="number" />
      </label>
      <input type="submit" />
      {bid > 0 &&
          <p>Your bid is: {bid}.  </p>}
    </form>
  )
}

createRoot(document.getElementById('root')).render(
  <BidForm />
);