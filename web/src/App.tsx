import './App.css'
import { BookingForm } from './components/BookingForm'
import { useClock } from './hooks/useClock'

function App() {
  const { timeString, dateString } = useClock();

  return (
    <div className="App">
      <h1>Appointment Systems</h1>
      <p className="current-time">{dateString} • {timeString}</p>
      <BookingForm />
    </div>
  )
}

export default App

