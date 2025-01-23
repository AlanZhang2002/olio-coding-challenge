# Olio Labs Coding Challenge

## Project Setup

There are two main parts to the project, the frontend and the backend. The frontend is built using React and Vite, the backend is built using Node.js and Express. 

### Environment Variables

- `VITE_API_URL`: The URL of the backend API. This is set in the `client/.env` file.

- `AIRTABLE_API_KEY`: The Airtable API key. This is set in the `server/.env` file.
- `AIRTABLE_BASE_ID`: The Airtable base ID. This is set in the `server/.env` file.
- `PORT`: The port number for the backend server. This is set in the `server/.env` file.

### Frontend

```bash
cd client
# install dependencies
npm install

# run app
npm run dev
```
### Backend

```bash
cd server
# install dependencies
npm install

# run app
node index.js
```
