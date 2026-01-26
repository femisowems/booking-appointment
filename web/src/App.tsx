import './App.css'
import { TicketBookingFlow } from './components/TicketBookingFlow'
import { useClock } from './hooks/useClock'

function App() {
  const { timeString, dateString } = useClock();

  return (
    <div className="App">
      <h1>Event Tickets</h1>
      <p className="current-time">{dateString} • {timeString}</p>
      <TicketBookingFlow />
    </div>
  )
}

export default App

