import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import PriorExperimentsPage from './pages/PriorExperimentsPage';
import ApparatusSelect from './ApparatusSelect';

import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [selectedApparatus, setSelectedApparatus] = useState(null);
  const [apparatusInstructions, setApparatusInstructions] = useState('');
  const [injectionVolume, setInjectionVolume] = useState('');
  const [syringeColor, setSyringeColor] = useState('');
  const [apparatusNotes, setApparatusNotes] = useState('');
  const [experimentNotes, setExperimentNotes] = useState(''); 
  const [apparatusOptions, setApparatusOptions] = useState([]);

  const fetchData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/experiment`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setData(data);
      
      // Fetching apparatuses to be listed
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/apparatuses?experimentId=${data[0].experiment_id}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const apparatuses = await response.json();
        const apparatusesArray = apparatuses.map(apparatus => apparatus.apparatus_id);
        // console.log('Apparatuses:', apparatusesArray);
        setApparatusOptions(apparatusesArray);
      } catch (error) {
        console.error('Error fetching apparatuses:', error);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleApparatusChange = async (selectedApparatus) => {
    setSelectedApparatus(selectedApparatus);
    setApparatusNotes('');
  
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/apparatus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apparatusId: selectedApparatus.value })
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const apparatus_data = await response.json();
      
      setApparatusInstructions(apparatus_data.instructions);
      if (apparatus_data.drug_ != "None") {
        setInjectionVolume(apparatus_data.injection_volume);
        setSyringeColor(apparatus_data.syringe_color);
      }

      setApparatusNotes(apparatus_data.experimenter_notes);
      setExperimentNotes(data.experimenter_notes);

    } catch (error) {
      console.error('Error sending data to backend:', error);
    }
  };

  const handleApparatusNotesChange = (event) => {
    setApparatusNotes(event.target.value);
  };

  const handleExperimentNotesChange = (event) => {
    setExperimentNotes(event.target.value);
  };

  const handleApparatusSubmit = async (event) => {
    event.preventDefault();
    console.log('Submitting Apparatus Notes:', apparatusNotes);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/apparatus`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apparatusId: selectedApparatus.value, notes: apparatusNotes })
      });
  
      if (!response.ok) { // this will error out without write access
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      console.log('Data from backend:', data);
    } catch (error) {
      console.error('Error sending data to backend:', error);
    }
  };

  const handleExperimentSubmit = async (event) => {
    event.preventDefault();
    console.log('Experiment Notes Submitted:', experimentNotes);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/experiment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ experimentId: selectedExperiment.value, notes: experimentNotes })
      });
  
      if (!response.ok) { // this will error out without write access
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      console.log('Data from backend:', data);
    } catch (error) {
      console.error('Error sending data to backend:', error);
    }
  };
  
  // const refreshData = () => {
  //   setSelectedApparatus(null);
  //   setApparatusNotes('');
  //   setExperimentNotes('');
  //   setInjectionVolume('');
  //   setSyringeColor('');
  //   setApparatusOptions([]);
  //   fetchData();
  // };
  
  // Fetch data on load
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Router>
      <div className="App">
        <nav>
          <Link to="/">Today's Experiments</Link>
          <Link to="/prior-experiments">Prior Experiments</Link>
        </nav>
        <Routes>
          <Route path="/prior-experiments" element={<PriorExperimentsPage />} />
          <Route path="/" element={
            <>
              {/* <button className="refresh-button" onClick={fetchData}>Refresh Data</button> */}
              <div>
                {data.map((item, index) => (
                  <div key={index}>
                    <h3>Today's Instructions</h3>
                    <p>{item.general_instructions}</p>
                  </div>
                ))}
              </div>
              <p>Selected Apparatus: {selectedApparatus ? selectedApparatus.label : 'None'}</p>
              <ApparatusSelect 
                options={apparatusOptions} 
                onChange={handleApparatusChange} 
              />
              {selectedApparatus ? (
                <>
                  <div>
                    <p>Apparatus Instructions: {apparatusInstructions}</p>
                    {injectionVolume ? <p>Injection Volume: {injectionVolume}</p> : null}
                    {syringeColor ? <p>Syringe Color: {syringeColor}</p> : null}
                  </div>
                  <div className="flex-container"> 
                    <form onSubmit={handleApparatusSubmit} className="centered-form">
                      <label>
                        Apparatus Notes:
                        <textarea 
                          className="text-area" 
                          value={apparatusNotes} 
                          onChange={handleApparatusNotesChange} 
                          placeholder="Add apparatus notes..." 
                        />
                      </label>
                      <button type="submit">Submit Apparatus Notes</button>
                    </form>
                    <form onSubmit={handleExperimentSubmit} className="centered-form">
                      <label>
                        Experiment Notes:
                        <textarea 
                          className="text-area" 
                          value={experimentNotes} 
                          onChange={handleExperimentNotesChange} 
                          placeholder="Add experiment notes..." 
                        />
                      </label>
                      <button type="submit">Submit Experiment Notes</button>
                    </form>
                  </div>
                </>
              ) : null}
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
