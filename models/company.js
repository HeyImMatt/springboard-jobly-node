const db = require("../db");
const ExpressError = require("../helpers/ExpressError");

class Company {

  static async findAll(data) {
    let baseQuery = `SELECT handle, name FROM companies`;
    let whereExpressions = [];
    let queryValues = [];

    if (+data.min_employees >= +data.max_employees) {
      throw new ExpressError(
        "Min employees must be less than max employees",
        400
      );
    }

    if (data.min_employees) {
      queryValues.push(+data.min_employees);
      whereExpressions.push(`num_employees >= $${queryValues.length}`);
    }

    if (data.max_employees) {
      queryValues.push(+data.max_employees);
      whereExpressions.push(`num_employees <= $${queryValues.length}`);
    }

    if (data.search) {
      queryValues.push(`%${data.search}%`);
      whereExpressions.push(`name ILIKE $${queryValues.length}`);
    }

    if (whereExpressions.length > 0) {
      baseQuery += " WHERE ";
    }

    let finalQuery =
      baseQuery + whereExpressions.join(" AND ") + " ORDER BY name";
    const companiesRes = await db.query(finalQuery, queryValues);
    return companiesRes.rows;
  }

  static async findOne(handle) {
    const result = await db.query(`
      SELECT * FROM companies
      WHERE handle = $1`, [handle]);
    if (result.rows === 0) {
      return null;
    }
    return result.rows[0]
  }

  static async create(data) {
    const result = await db.query(
      `INSERT INTO companies (
          handle,
          name,
          num_employees,
          description,
          logo_url)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING handle,
          name,
          num_employees,
          description,
          logo_url`,
      [data.handle, data.name, data.num_employees, data.description, data.logo_url]
    );
    return result.rows[0];
  }
}

module.exports = Company;