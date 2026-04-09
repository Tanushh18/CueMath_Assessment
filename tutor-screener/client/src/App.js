import { useState } from 'react';
import Welcome from './pages/Welcome';
import Interview from './pages/Interview';
import Results from './pages/Results';

export default function App() {
  const [page, setPage] = useState('welcome');
  const [name, setName] = useState('');
  const [assessment, setAssessment] = useState(null);

  if (page === 'welcome') {
    return <Welcome onStart={(n) => {
      setName(n);
      setPage('interview');
    }} />;
  }

  if (page === 'interview') {
    return <Interview name={name} onFinish={(a) => {
      setAssessment(a);
      setPage('results');
    }} />;
  }

  if (page === 'results') {
    return <Results
      assessment={assessment}
      onRestart={() => {
        setAssessment(null);
        setPage('welcome');
      }}
    />;
  }
}