import GoogleLoginButton from './components/GoogleLoginButton'
import './App.css'

function App() {
  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <p className="login-card__eyebrow">Found Link Kenya</p>
        <h1 id="login-title">Welcome back</h1>
        <p className="login-card__description">
          Sign in to continue to your Found Link Kenya account.
        </p>
        <GoogleLoginButton />
      </section>
    </main>
  )
}

export default App
