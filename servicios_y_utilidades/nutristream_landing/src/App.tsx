
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import Hardware from './components/Hardware'
import Waitlist from './components/Waitlist'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-dark-950 overflow-x-hidden">
      <Navbar />
      <Hero />
      <Features />
      <Hardware />
      <Waitlist />
      <Footer />
    </div>
  )
}

export default App
