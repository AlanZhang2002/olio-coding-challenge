import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import './App.css';

function PriorExperimentsPage() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [priorExperiments, setPriorExperiments] = useState([]);
  const [experimentDates, setExperimentDates] = useState([]);

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

  // Get valid experiment once
  useEffect(() => {
    fetchExperimentDates();
  }, []);

  return (
    <>
      <div className="DatePickerPage">
        <DatePicker 
          showIcon
          highlightDates={experimentDates}
          includeDates={experimentDates}
          selected={selectedDate} 
          onChange={(date) => {
            setSelectedDate(date);
            fetchPriorExperiments(date);
          }} 
          // maxDate={new Date()} // Prevent future dates
        />
      </div>
      <div>
        {priorExperiments.map((item, index) => (
          <div key={index}>
            {/* <h3>Experiment ID: {item.experiment_id}</h3>
            <p>Date: {item.experiment_date}</p> */}
            <h3>Today's Instructions</h3>
            <p>{item.general_instructions}</p>
            {/* <p>Apparatus Metadata: {item.apparatus_metadata.join(', ')}</p> */}
          </div>
        ))}
    </div>
  </> 
  );
}

export default PriorExperimentsPage;