import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './utils/Routes';

function App() {

  return (
    <>  
    <Router>
      <div className="flex">
        <div className="flex-grow">
          <AppRoutes />
        </div>
      </div>
    </Router>
    </>
  )
}

export default App
