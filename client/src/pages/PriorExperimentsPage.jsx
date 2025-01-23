import React, { useEffect, useState } from 'react';
import ApparatusSelect from '../components/ApparatusSelect';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import '../styles/App.css';

function PriorExperimentsPage() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedApparatus, setSelectedApparatus] = useState(null);
  const [priorExperiments, setPriorExperiments] = useState([]);
  const [experimentDates, setExperimentDates] = useState([]);
  const [apparatusOptions, setApparatusOptions] = useState([]);
  const [apparatusData, setApparatusData] = useState([]);

  const fetchPriorExperiments = async (date) => {
    try {
      // Transforming date to simplified ISO string in UTC
      const UTCdate = new Date(date.getTime() - (new Date().getTimezoneOffset() * 60 * 1000)).toISOString().slice(0, 10);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/experiment/${UTCdate}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setPriorExperiments(data); 

      // Fetching apparatuses to be listed
      console.log('Prior Experiment:', priorExperiments);
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
      console.error('Error fetching prior experiments:', error);
    }
  };

  const fetchExperimentDates = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/experiment_dates`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      // Transforming to be dates in local time, to be used in DatePicker
      const dates = data.map(experiment => new Date(new Date(experiment.experiment_date).getTime() + (new Date().getTimezoneOffset() * 60 * 1000)));
      console.log('Experiment Dates:', dates);
      setExperimentDates(dates);
    } catch (error) {
      console.error('Error fetching prior experiments:', error);
    }
  };

  const handleApparatusChange = async(apparatus) => {
    setSelectedApparatus(apparatus);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/apparatus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apparatusId: apparatus.value })
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const apparatus_data = await response.json();
      setApparatusData(apparatus_data);
      console.log('Apparatus Data:', apparatus_data);
    } catch (error) {
      console.error('Error sending data to backend:', error);
    }
  };

  // Get valid experiment once
  useEffect(() => {
    fetchExperimentDates();
  }, []);

  return (
    <>
      <div className="DatePicker">
        <h3>Experiment Date</h3>
        <DatePicker 
          showIcon
          highlightDates={experimentDates}
          includeDates={experimentDates}
          selected={selectedDate} 
          onChange={(date) => {
            setSelectedDate(date);
            fetchPriorExperiments(date);
          }} 
        />
      </div>
      <div>
        {priorExperiments.map((item, index) => (
          <div key={index}>
            <h3>General Instructions</h3>
            <p>{item.general_instructions}</p>
          </div>
        ))}
        {/* <p>Selected Apparatus: {selectedApparatus ? selectedApparatus.label : 'None'}</p> */}
        <ApparatusSelect 
          options={apparatusOptions} 
          onChange={handleApparatusChange} 
        />
        {selectedApparatus ? 
          <>
            <h3>Apparatus Information</h3>
            <p>Instructions: {apparatusData.instructions}</p>
            <p>Injection: {apparatusData.dose_mg_kg}mg/kg {apparatusData.drug_} ({apparatusData.injection_volume}mL {apparatusData.syringe_color})</p>
            <p>Flagged Issues: {(apparatusData.flagged_issues === undefined || apparatusData.flagged_issues.length == 0) ? "None" : apparatusData.flagged_issues}</p>
            <p>QC Notes: {(apparatusData.QC_box === undefined || apparatusData.QC_box.length == 0) ? "None" : apparatusData.QC_box}</p>
            <p>Experimenter Notes: {apparatusData.experimenter_notes}</p>

          </>
        : null}
    </div>
  </> 
  );
}

export default PriorExperimentsPage;