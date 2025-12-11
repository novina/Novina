export default function HomePage() {
  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Novina - Test Page</h1>
      <p>If you see this, routing works!</p>
      <p>Time: {new Date().toISOString()}</p>
    </div>
  )
}
