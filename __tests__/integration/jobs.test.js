const request = require('supertest');
const app = require('../../app');
const db = require('../../db');
const Job = require('../../models/job');
const Company = require('../../models/company');

const testCompany1 = {
  handle: 'testco1',
  name: 'Test Company 1',
  num_employees: 100,
  description: 'My first test company',
  logo_url: 'https://cdn.pixabay.com/photo/2016/08/25/07/30/orange-1618917_1280.png',
}

const testJob1 = {
  title: 'Test Job 1',
  salary: 100000.00,
  equity: 0.01,
  company_handle: 'testco1',
}

beforeEach(async () => {
  try {
    await Company.create(testCompany1);
    await Job.create(testJob1);
  } catch(e) {
    console.log(e);
  }
})

afterEach(async () => {
  try {
    await db.query('DELETE FROM jobs');
    await db.query('DELETE FROM companies');
  } catch(e) {
    console.log(e);
  }
})

afterAll(async () => {
  try {
    await db.end();
  } catch(e) {
    console.log(e);
  }
})

describe('GET /jobs', () => {
  test('Gets all job data', async () => {
    const resp = await request(app).get('/jobs');
    expect(resp.statusCode).toBe(200);
    expect(resp.body.jobs).toHaveLength(1);
    expect(resp.body.jobs[0]).toHaveProperty('id');
    })
})

describe('POST /jobs', () => {
  test('Creates a new job', async () => {
    const job = {
      title: 'New Job',
      salary: 80000,
      equity: 0.01,
      company_handle: 'testco1',
    }
    const resp = await request(app).post('/jobs').send(job);

    expect(resp.statusCode).toBe(201);
    expect(resp.body.job.title).toEqual(job.title);
  });

  test('Missing data fails json validation', async () => {
    const resp = await request(app).post('/jobs').send({title: 'Fail Job'});
    expect(resp.statusCode).toBe(400);
  })
})

describe('GET /jobs/[id]', () => {
  test('Gets single job data', async () => {
    const jobResp = await request(app).get('/jobs');
    const job = jobResp.body.jobs[0];
    const resp = await request(app).get(`/jobs/${job.id}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body.job.title).toEqual(job.title);
    })

    test('Returns 404 error if job not found', async () => {
      const resp = await request(app).get('/jobs/0');
      expect(resp.statusCode).toBe(404);
    })
})

describe('PATCH /jobs', () => {
  test('Edits a job', async () => {
    const jobResp = await request(app).get('/jobs');
    const job = jobResp.body.jobs[0];
    const resp = await request(app).patch(`/jobs/${job.id}`).send({
      title: 'Updated Job Name',
      company_handle: job.company_handle
    });

    expect(resp.statusCode).toBe(200);
    expect(resp.body.job.title).toEqual('Updated Job Name');
  });

  test('Returns 404 error if job not found', async () => {
    const resp = await request(app).patch('/jobs/0').send({
      title: 'Updated Job Name',
      company_handle: testJob1.company_handle
    });
    expect(resp.statusCode).toBe(404);
  })

  test('Prevents a bad update', async () => {
    const jobResp = await request(app).get('/jobs');
    const job = jobResp.body.jobs[0];
    const resp = await request(app).patch(`/jobs/${job.id}`).send({
        title: job.title,
        company_handle: job.company_handle,
        notRealProp: 'Do not update',
      });
    expect(resp.statusCode).toBe(400);
  });
})

describe('DELETE /jobs/[id]', () => {
  test('Deletes a job', async () => {
    const jobResp = await request(app).get('/jobs');
    const job = jobResp.body.jobs[0];
    const resp = await request(app).delete(`/jobs/${job.id}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body.message).toEqual('Job deleted');;
    })

    test('Returns 404 error if job not found', async () => {
      const resp = await request(app).delete('/jobs/0');
      expect(resp.statusCode).toBe(404);
    })
})