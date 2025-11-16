function BidForm() {
  return (
    <form onSubmit={handleSubmit}>
      <label>Bid Amount:
        <input
            type="number"
            value={bid}
            onChange={handleChange}
         />
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