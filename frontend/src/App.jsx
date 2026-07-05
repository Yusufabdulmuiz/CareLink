import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import NewPatient from './pages/NewPatients';
import Patients from './pages/RecentPatients';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/new-patient" element={<NewPatient />} />
      </Routes>
    </Layout>
  );
}

export default App;