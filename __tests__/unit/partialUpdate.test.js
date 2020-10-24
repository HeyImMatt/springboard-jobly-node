const sqlForPartialUpdate = require("../../helpers/partialUpdate");

describe("partialUpdate()", () => {
  it("should generate a proper partial update query", () => {
    const table = 'companies';
    const items = {
      num_employees: 5,
      description: 'A company that specializes in tests'
    };
    const key = 'handle';
    const id = 'testco';

    const { query, values } = sqlForPartialUpdate(table, items, key, id);

    expect(query).toEqual('UPDATE companies SET num_employees=$1, description=$2 WHERE handle=$3 RETURNING *');
    expect(values).toBeInstanceOf(Array);
    expect(values).toEqual([ items.num_employees, items.description, id ])
  });
});
