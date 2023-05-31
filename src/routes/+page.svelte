<script lang="ts">
  import { onMount } from 'svelte'
  import { Editor } from '$lib/index.js'

  let editorRef

  let jsonSchemaContent = {
    json: {
      $id: 'https://jsoneditoronline.org/friends.schema.json',
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
          email: {
            type: 'string',
            format: 'email',
            description: 'Optional email address of the friend.'
          }
        },
        required: ['name', 'age']
      }
    }
  }

  let jsonContent = {
    json: [
      { name: 'Chris', age: 23, email: 'chris@example.com' },
      { name: 'Emily', age: 19, email: 'emily@example.com' },
      { name: 'Joe', age: 32 },
      { name: 'Kevin', age: 19 },
      { name: 'Michelle', age: 27, email: 'michelle@example.com' },
      { name: 'Robert', age: 45 },
      { name: 'Sarah', age: 31 }
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
