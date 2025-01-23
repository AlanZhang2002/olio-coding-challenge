const express = require('express');
const dotenv = require('dotenv');
const Airtable = require('airtable');

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

const cors = require('cors');
app.use(cors());
app.use(express.json());

// Initialize Airtable
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

// Endpoint to fetch today's experiment
app.get('/api/experiment', async (req, res) => {
  try {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD

    // for testing
    // const formattedDate = '2025-01-14'

    // realistically there should only be one record per day
    const records = await base('experiment_metadata').select({
      filterByFormula: `DATESTR({experiment_date}) = "${formattedDate}"`
    }).firstPage();
    const responseData = records.map(record => record.fields);
    console.log('Response Data:', JSON.stringify(responseData));

    res.json(responseData);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Error fetching data' });
  }
});

// Endpoint to fetch experiment by date
app.get('/api/experiment/:date', async (req, res) => {
  try {
    const date = req.params.date;
    console.log('Fetching experiment for date:', date);
    
    // realistically there should only be one record per day
    const records = await base('experiment_metadata').select({
      filterByFormula: `DATESTR({experiment_date}) = "${date}"`
    }).firstPage();
    const responseData = records.map(record => record.fields);
    console.log('Response Data:', JSON.stringify(responseData));

    res.json(responseData);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Error fetching data' });
  }
});

// Endpoint to fetch apparatus based on apparatus ID (not record id)
app.post('/api/apparatus', async (req, res) => {
  try {
    // assume apparatus id is unique
    const apparatusId = req.body.apparatusId;
    const record = await base('apparatus_metadata').select({
      filterByFormula: `apparatus_id = "${apparatusId}"`,
      maxRecords: 1
    }).all();
    // console.log('Apparatus ID:', record[0].id);
    // const record = await base('apparatus_metadata').find(id[0].id);
    if (record[0]) {
      res.json(record[0].fields);
    } else {
      res.status(404).json({ error: 'Apparatus not found' });
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Error fetching data' });
  }
});

// Endpoint to update apparatus notes
app.put('/api/apparatus', async (req, res) => {
  try {
    const apparatusId = req.body.apparatusId;
    const notes = req.body.notes;
    // Get record id from apparatus id
    const id = await base('apparatus_metadata').select({
      filterByFormula: `apparatus_id = "${apparatusId}"`,
      maxRecords: 1
    }).all();

    const record = await base('apparatus_metadata').update([
        {
            'id': id[0].id,
            'fields': {
                'experimenter_notes': notes
            }
        }
    ], function(err, records) {
        if (err) {
            console.error(err);
            return;
        }
        records.forEach(function(record) {
            console.log(record.get('apparatus_id'));
        });
    });
    res.json(record.get('apparatus_id'));
  } catch (error) {
    console.error('Error updating apparatus:', error);
    res.status(500).json({ error: 'Error updating apparatus' });
  }
});

// Endpoint to update experiment notes
app.put('/api/experiment', async (req, res) => {
  try {
    const experimentId = req.body.experimentId;
    const notes = req.body.notes;
    const record = await base('experiment_metadata').update([
        {
            'id': experimentId,
            'fields': {
                'experimenter_notes': notes
            }
        }
    ], function(err, records) {
        if (err) {
            console.error(err);
            return;
        }
        records.forEach(function(record) {
            console.log(record.get('experiment_id'));
        });
    });
    res.json(record.get('experiment_id'));
  } catch (error) {
    console.error('Error updating experiment:', error);
    res.status(500).json({ error: 'Error updating experiment' });
  }
});

// Endpoint to fetch all experiment dates
app.get('/api/experiment_dates', async (req, res) => {
    try {
      const records = await base('experiment_metadata').select({
          fields: ['experiment_date'],
          filterByFormula: `NOT({experiment_date} = "")`
      }).all();
      const responseData = records.map(record => record.fields);
      res.json(responseData);
    } catch (error) {
        console.error('Error fetching experiment dates:', error);
        res.status(500).json({ error: 'Error fetching experiment dates' });
    }
});

// Endpoint to fetch all apparatuses from experiment
app.get('/api/apparatuses', async (req, res) => {
    try {
        const experimentId = req.query.experimentId;
        const records = await base('apparatus_metadata').select({
            fields: ['apparatus_id'],
            filterByFormula: `experiment_id = "${experimentId}"`
        }).all();
        const responseData = records.map(record => record.fields);
        // console.log('Records:', responseData);
        res.json(responseData);
    } catch (error) {
        console.error('Error fetching apparatuses:', error);
        res.status(500).json({ error: 'Error fetching apparatuses' });
    }
});

// Endpoint to fetch apparatus notes and experiment notes
app.get('/api/notes', async (req, res) => {
  try {
      const experimentId = req.query.experimentId;
      const apparatusId = req.query.apparatusId;
      console.log('Fetching notes for experimentId:', experimentId, 'and apparatusId:', apparatusId);

      const experimentNotes = await base('experiment_metadata').select({
        filterByFormula: `experiment_id = "${experimentId}"`,
        fields: ['experimenter_notes']
      }).all();

      const apparatusNotes = await base('apparatus_metadata').select({
        filterByFormula: `AND(apparatus_id = "${apparatusId}", experiment_id = "${experimentId}")`,
        fields: ['experimenter_notes']
      }).all();

      const records = [experimentNotes[0], apparatusNotes[0]];
      const responseData = records.map(record => record.fields);
      res.json(responseData);
  } catch (error) {
      console.error('Error fetching experiment dates:', error);
      res.status(500).json({ error: 'Error fetching experiment dates' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});