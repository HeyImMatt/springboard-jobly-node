const db = require("../db");
const ExpressError = require("../helpers/ExpressError");
const partialUpdate = require('../helpers/partialUpdate');

class Job {

  static async findAll(data) {
    let baseQuery = "SELECT id, title, company_handle FROM jobs";
    let whereExpressions = [];
    let queryValues = [];

    if (data.min_salary) {
      queryValues.push(+data.min_employees);
      whereExpressions.push(`min_salary >= $${queryValues.length}`);
    }

    if (data.max_equity) {
      queryValues.push(+data.max_employees);
      whereExpressions.push(`min_equity >= $${queryValues.length}`);
    }

    if (data.search) {
      queryValues.push(`%${data.search}%`);
      whereExpressions.push(`title ILIKE $${queryValues.length}`);
    }

    if (whereExpressions.length > 0) {
      baseQuery += " WHERE ";
    }

    let finalQuery = baseQuery + whereExpressions.join(" AND ");
    const jobsRes = await db.query(finalQuery, queryValues);
    return jobsRes.rows;
  }

  static async findOne(id) {
    const result = await db.query(`
      SELECT * FROM jobs
      WHERE id = $1`, [id]);
    if (result.rows.length === 0) {
      throw new ExpressError(`No job with the id '${id}' found.`, 404);
    }
    job = result.rows[0];

    const companyResult = await db.query(
      `SELECT name, num_employees, description, logo_url 
        FROM companies 
        WHERE handle = $1`,
      [job.company_handle]
    );

    job.company = companyResult.rows[0];

    return job;
  }

  static async create(data) {
    try {
      const result = await db.query(
      `INSERT INTO jobs (
          title,
          salary,
          equity,
          company_handle)
        VALUES ($1, $2, $3, $4)
        RETURNING id,
          title,
          salary,
          equity,
          company_handle`,
      [data.title, data.salary, data.equity, data.company_handle]
    );
    return result.rows[0];
    } catch(e) {
      throw new ExpressError(`Error creating job: ${e}`, 400)
    }
  }

  static async update(id, data) {
    const { query, values } = partialUpdate('jobs', data, 'id', id)
      const result = await db.query(query, values);

      if (result.rows.length === 0) {
        throw new ExpressError(`There is no job with id '${id}'`, 404);
      };

      return result.rows[0];
  }

  static async remove(id) {
    const result = await db.query(
      `DELETE FROM jobs
          WHERE id=$1
        RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(`There is no job with id '${id}'`, 404);
    }
  }
}

module.exports = Job;