import Ajv from 'ajv'

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'integer' }
  },
  required: ['name', 'age']
}

const data = { name: 'Chris', age: 23 }

const ajv = new Ajv()
const valid = ajv.validate(schema, data)
if (valid) {
  console.log('Data is valid!')
} else {
  console.error(ajv.errors)
}
