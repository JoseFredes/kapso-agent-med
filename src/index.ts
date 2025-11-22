import { Hono } from 'hono'
import fetch from 'node-fetch';

interface Env {
  API_KEY: string;
  PHONE_NUMBER: string;
}

const app = new Hono<{ Bindings: Env }>()


app.get('/', (c) => {
  return c.text('Hello Hono!')
})


async function callExternalApi(name: string, dateTime: string, location: string, apiKey: string, phoneNumber: string) {
  const response = await fetch(
    'https://api.kapso.ai/platform/v1/workflows/6d980998-d67e-46f4-8a63-78bbb4027851/executions',
    {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        workflow_execution: {
          phone_number: phoneNumber,
          variables: {
            user_name: name,
            date_time: dateTime,
            location: location,
          }
        }
      })
    }
  );
  return await response.json();
}

app.post('/contact', async (c) => {
  const { name, dateTime, location } = await c.req.json();

  const externalResponse = await callExternalApi(name, dateTime, location, c.env.API_KEY, c.env.PHONE_NUMBER);

  const responseData = {
    dateTime,
    location,
    status: 'initiated',
    rules: {
      reschedule: false
    },
    options: {},
    metadata: {},
    externalResponse
  };

  return c.json(responseData);
});

export default app
