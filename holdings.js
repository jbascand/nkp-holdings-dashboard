// This file should be saved as: netlify/functions/holdings.js
// It handles storing and retrieving holdings data from Netlify Blob Storage

import { getStore } from '@netlify/blobs';

const BLOB_KEY = 'holdings-data';

export default async (req, context) => {
  try {
    console.log(`[${new Date().toISOString()}] ${req.method} request`);

    // Handle GET requests - retrieve data
    if (req.method === 'GET') {
      try {
        const store = getStore({ name: 'holdings' });
        const data = await store.get(BLOB_KEY);
        
        if (data) {
          const parsed = JSON.parse(data);
          console.log('✅ Data retrieved from blob storage');
          return new Response(JSON.stringify(parsed), {
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        } else {
          console.log('ℹ️ No data in blob storage yet');
          return new Response(JSON.stringify(null), {
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }
      } catch (err) {
        console.error('Error reading blob:', err);
        return new Response(JSON.stringify(null), {
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    }

    // Handle POST requests - store data
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        
        if (!body.holdingsData || !body.accountsData) {
          return new Response('Missing required fields', {
            status: 400,
            headers: { 'Access-Control-Allow-Origin': '*' }
          });
        }

        const store = getStore({ name: 'holdings' });
        const dataToStore = JSON.stringify(body);
        
        await store.set(BLOB_KEY, dataToStore);
        
        console.log(`✅ Data saved to blob storage (${body.holdingsData.length} holdings, ${Object.keys(body.accountsData).length} accounts)`);
        
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Data saved successfully',
          timestamp: new Date().toISOString()
        }), {
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      } catch (err) {
        console.error('Error writing blob:', err);
        return new Response(`Error: ${err.message}`, {
          status: 500,
          headers: { 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    // Handle OPTIONS for CORS
    if (req.method === 'OPTIONS') {
      return new Response('OK', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    return new Response('Method not allowed', { 
      status: 405,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  } catch (err) {
    console.error('Function error:', err);
    return new Response(`Error: ${err.message}`, {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
};
