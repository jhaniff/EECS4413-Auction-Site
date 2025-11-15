function BidForm() {
  return (
    <form>
      <label>Bid Amount:
        <input type="number" />
      </label>
    </form>
  )
}

createRoot(document.getElementById('root')).render(
  <BidForm />
);