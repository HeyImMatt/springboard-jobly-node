const request = require('supertest');
const app = require('../../app');
const db = require('../../db');
const Company = require('../../models/company');

const testCompany1 = {
  handle: 'testco1',
  name: 'Test Company 1',
  num_employees: 100,
  description: 'My first test company',
  logo_url: 'https://cdn.pixabay.com/photo/2016/08/25/07/30/orange-1618917_1280.png',
}

beforeEach(async () => {
  try {
    await Company.create(testCompany1);
  } catch(e) {
    console.log(e);
  }
})

afterEach(async () => {
  try {
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

describe('GET /companies', () => {
  test('Gets all company data', async () => {
    const resp = await request(app).get('/companies');
    expect(resp.statusCode).toBe(200);
    expect(resp.body.companies).toHaveLength(1);
    expect(resp.body.companies[0]).toHaveProperty('handle');
    })
})

describe('POST /companies', () => {
  test('Creates a new company', async () => {
    const company = {
      handle: 'newco',
      name: 'New Company',
      description: 'This is the new company',
      num_employees: 10,
      logo_url: 'https://cdn.pixabay.com/photo/2016/08/25/07/30/orange-1618917_1280.png',
    }
    const resp = await request(app).post('/companies').send(company);

    expect(resp.statusCode).toBe(201);
    expect(resp.body.company).toEqual(company);
  });

  test('Missing data fails json validation', async () => {
    const resp = await request(app).post('/companies').send({handle: 'failco'});
    expect(resp.statusCode).toBe(400);
  })

  test('Prevents creating duplicate company', async () => {
    const resp = await request(app).post('/companies').send({
      handle: testCompany1.handle, 
      name: testCompany1.name
    });
    expect(resp.statusCode).toBe(400);
  })
})

describe('GET /companies/[handle]', () => {
  test('Gets single company data', async () => {
    const resp = await request(app).get(`/companies/${testCompany1.handle}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body.company).toEqual({...testCompany1, jobs: []});;
    })

    test('Returns 404 error if company not found', async () => {
      const resp = await request(app).get('/companies/nocompany');
      expect(resp.statusCode).toBe(404);
    })
})

describe('PATCH /companies', () => {
  test('Edits a company', async () => {
    const resp = await request(app).patch(`/companies/${testCompany1.handle}`).send({
      handle: `${testCompany1.handle}`,
      name: 'Updated Company Name',
    });

    expect(resp.statusCode).toBe(200);
    expect(resp.body.company).toEqual({...testCompany1, name: 'Updated Company Name'});
  });

  test('Returns 404 error if company not found', async () => {
    const resp = await request(app).patch('/companies/nocompany').send({
      handle: `${testCompany1.handle}`,
      name: 'Updated Company Name',
    });
    expect(resp.statusCode).toBe(404);
  })

  test('Prevents a bad update', async () => {
    const resp = await request(app).patch(`/companies/${testCompany1.handle}`).send({
        handle: `${testCompany1.handle}`, 
        name: `${testCompany1.name}`,
        notRealProp: 'Do not update',
      });
    expect(resp.statusCode).toBe(400);
  });
})

describe('DELETE /companies/[handle]', () => {
  test('Deletes a company', async () => {
    const resp = await request(app).delete(`/companies/${testCompany1.handle}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body.message).toEqual('Company deleted');;
    })

    test('Returns 404 error if company not found', async () => {
      const resp = await request(app).delete('/companies/nocompany');
      expect(resp.statusCode).toBe(404);
    })
})