<script lang="ts">
  import { onMount } from 'svelte'
  import { Editor } from '$lib/index.js'

  let editorRef

  let jsonSchemaContent = {
    json: {
      $id: 'https://example.com/person.schema.json',
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      title: 'Friends',
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: "The friend's name."
          },
          age: {
            description: 'Age in years which must be equal to or greater than zero.',
            type: 'integer',
            minimum: 0
          },
          city: {
            type: 'string',
            description: 'The city where the friend lives.'
          }
        },
        required: ['name', 'age', 'city']
      }
    }
  }

  let jsonContent = {
    json: [
      { name: 'Chris', age: 23, city: 'New York' },
      { name: 'Emily', age: 19, city: 'Atlanta' },
      { name: 'Joe', age: 32, city: 'New York' },
      { name: 'Kevin', age: 19, city: 'Atlanta' },
      { name: 'Michelle', age: 27, city: 'Los Angeles' },
      { name: 'Robert', age: 45, city: 'Manhattan' },
      { name: 'Sarah', age: 31, city: 'New York' }
    ]
  }

  onMount(() => {
    const testEditor = new Editor({ target: editorRef, props: { jsonSchemaContent, jsonContent } })
  })
</script>

<h1>JSON Schema Validator</h1>

<div bind:this={editorRef} class="json-schema-validator" />

<style lang="scss">
  .json-schema-validator {
    width: 100%;
    max-width: 1000px;
    height: 400px;
    display: flex;
  }
</style>
