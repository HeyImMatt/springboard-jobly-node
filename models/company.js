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
    if (result.rows.length === 0) {
      throw new ExpressError(`No company with the handle '${handle}' found.`, 404);
    }
    return result.rows[0]
  }

  static async create(data) {
    try {
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
    } catch(e) {
      throw new ExpressError(`Error creating company: ${e}`, 400)
    }
  }

  static async update(handle, data) {
    const result = await db.query(
      `UPDATE companies SET
          name=($1),
          num_employees=($2),
          description=($3),
          logo_url=($4)
          WHERE handle=$5
        RETURNING handle,
          name,
          num_employees,
          description,
          logo_url`,
      [data.name, data.num_employees, data.description, data.logo_url, handle]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(`There is no company with handle '${handle}'`, 404);
    }

    return result.rows[0];
  }

  static async remove(handle) {
    const result = await db.query(
      `DELETE FROM companies
          WHERE handle=$1
        RETURNING handle`,
      [handle]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(`There is no company with handle '${handle}'`, 404);
    }
  }
}

module.exports = Company;