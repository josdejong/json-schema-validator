<script lang="ts">
  import Ajv2019 from 'ajv/dist/2019'
  import Ajv2020 from 'ajv/dist/2020'
  import addFormats from 'ajv-formats'
  import Icon from 'svelte-awesome'

  import { faCheck, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
  import { disablePageScroll, enablePageScroll } from './pageScroll.js'
  import {
    type Content,
    createAjvValidator,
    isContentParseError,
    isContentValidationErrors,
    isTextContent,
    JSONEditor,
    type JSONValue,
    Mode,
    type OnChangeStatus,
    type ValidationError,
    ValidationSeverity,
    type Validator
  } from 'svelte-jsoneditor'
  import { draft6MetaSchema } from './json-schema-draft-06.js'

  export let jsonSchemaContent: Content = { text: '' }
  export let jsonContent: Content = { text: '' }

  let fullscreen = false
  let hasJsonSchemaError = false
  let hasJsonError = false
  let hasValidationErrors = false

  let editorRef
  let originalParentRef

  type StatusCode = 'ok' | 'error' | 'warning'

  interface Status {
    code: StatusCode
    description: string
  }

  $: applyFullscreen(fullscreen)

  $: validator = tryCreateValidator(jsonSchemaContent)

  // This is a workaround because the `onChange` of svelte-jsoneditor only triggers when the JSON contents changes,
  // not when the validator changes or when the initial contents contains a parse error
  $: updateValidationErrors(validator)

  let status: Status
  $: status = isEmptyContent(jsonSchemaContent)
    ? { code: 'warning', description: 'Please provide a JSON Schema document in the left panel' }
    : isEmptyContent(jsonContent)
    ? { code: 'warning', description: 'Please provide a JSON document in the right panel' }
    : hasJsonSchemaError
    ? {
        code: 'error',
        description: 'Cannot validate: the JSON Schema document itself is not valid'
      }
    : hasJsonError
    ? { code: 'error', description: 'The JSON document is invalid: it contains a syntax error' }
    : hasValidationErrors
    ? {
        code: 'error',
        description: 'The JSON document is invalid: it does not match the JSON Schema'
      }
    : { code: 'ok', description: 'The JSON document is valid according to the JSON Schema' }

  function tryCreateValidator(schemaContent: Content): Validator | undefined {
    const result = createValidator(schemaContent)

    hasJsonSchemaError = !!result.error

    return result.validator
  }

  function createValidator(schemaContent: Content): {
    validator: Validator | undefined
    error: Error | undefined
  } {
    try {
      const schema = isTextContent(schemaContent)
        ? JSON.parse(schemaContent.text)
        : schemaContent.json

      const validator = createAjvValidator({
        schema,
        onCreateAjv: () => {
          const Ajv =
            schema.$schema === 'https://json-schema.org/draft/2020-12/schema' ? Ajv2020 : Ajv2019

          const ajv = new Ajv({
            allErrors: true,
            verbose: true,
            $data: true
          })

          ajv.addMetaSchema(draft6MetaSchema)
          addFormats(ajv)

          return ajv
        }
      })

      return { validator, error: undefined }
    } catch (error) {
      return { validator: undefined, error: error as Error }
    }
  }

  function updateValidationErrors(validator: Validator | undefined) {
    try {
      const json = isTextContent(jsonContent) ? JSON.parse(jsonContent.text) : jsonContent.json

      hasJsonError = false

      const errors = validator ? validator(json) : []
      hasValidationErrors = errors.length > 0
    } catch (err) {
      hasJsonError = true
    }
  }

  function handleChange(
    content: Content,
    previousContent: Content,
    { contentErrors }: OnChangeStatus
  ) {
    hasJsonError = isContentParseError(contentErrors)
    hasValidationErrors = isContentValidationErrors(contentErrors)
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && fullscreen) {
      fullscreen = false
    }
  }

  function applyFullscreen(fullscreen: boolean) {
    if (fullscreen) {
      if (editorRef) {
        originalParentRef = editorRef.parentNode
        originalParentRef.removeChild(editorRef)
        document.body.appendChild(editorRef)
        disablePageScroll()
      }
    } else {
      if (editorRef && originalParentRef) {
        document.body.removeChild(editorRef)
        originalParentRef.appendChild(editorRef)
        enablePageScroll()
      }
    }
  }

  function isEmptyContent(content: Content): boolean {
    return isTextContent(content) && content.text.trim() === ''
  }

  function schemaValidator(json: JSONValue): ValidationError[] {
    const { error } = createValidator({ json })

    return error
      ? [
          {
            path: [],
            message: String(error),
            severity: ValidationSeverity.error
          }
        ]
      : []
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="json-schema-validator-container" class:fullscreen bind:this={editorRef}>
  <div class="json-schema-validator-row json-schema-validator-flex">
    <div class="json-schema-validator-column">
      <div class="json-schema-validator-menu">
        <div class="json-schema-validator-title">JSON Schema</div>
      </div>
      <div class="json-schema-validator-editor">
        <JSONEditor
          bind:content={jsonSchemaContent}
          validator={schemaValidator}
          mode={Mode.text}
          mainMenuBar={false}
          statusBar={false}
        />
      </div>
    </div>
    <div class="json-schema-validator-column">
      <div class="json-schema-validator-menu">
        <div class="json-schema-validator-title">JSON</div>
        <button
          class="json-schema-validator-menu-button"
          on:click={() => (fullscreen = !fullscreen)}
          title="Toggle full screen (ESC to exit)"
        >
          {fullscreen ? 'Exit full screen (ESC)' : 'Full screen'}
        </button>
      </div>
      <div class="json-schema-validator-editor">
        <JSONEditor
          bind:content={jsonContent}
          {validator}
          onChange={handleChange}
          mode={Mode.text}
          mainMenuBar={false}
          statusBar={false}
        />
      </div>
    </div>
  </div>

  <div class="json-schema-validator-row">
    {#if status.code === 'ok'}
      <div class="json-schema-validator-status json-schema-validator-status-ok">
        <Icon data={faCheck} />
        {status.description}
      </div>
    {/if}
    {#if status.code === 'error'}
      <div class="json-schema-validator-status json-schema-validator-status-error">
        <Icon data={faTriangleExclamation} />
        {status.description}
      </div>
    {/if}
    {#if status.code === 'warning'}
      <div class="json-schema-validator-status json-schema-validator-status-warning">
        <Icon data={faTriangleExclamation} />
        {status.description}
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  $margin: 10px;
  $color: #fff;
  $button-background-color: dodgerblue;
  $menu-background-color: #eaeaea;
  $font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu;
  $font-size: 11pt;

  .json-schema-validator-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: $margin;
    overflow: hidden;
    background: white;

    &.fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      max-width: unset;
      box-sizing: border-box;
      border: 10px solid white;
      z-index: 9999;
    }

    .json-schema-validator-row {
      display: flex;
      overflow: hidden;
      gap: $margin;

      &.json-schema-validator-flex {
        flex: 1;
      }

      .json-schema-validator-column {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;

        .json-schema-validator-menu {
          display: flex;
          background: $menu-background-color;
          font-family: $font-family;
          font-size: $font-size;
          flex-wrap: wrap;
          align-items: center;
          gap: $margin;

          .json-schema-validator-title {
            flex: 1;
            padding: 5px 10px;
            text-align: center;
          }

          button {
            cursor: pointer;
          }

          > * {
            margin: 5px;
          }

          .json-schema-validator-menu-button {
            background: $button-background-color;
            color: $color;
            font-family: inherit;
            font-size: inherit;
            border: none;
            padding: 5px 10px;
            border-radius: 3px;

            &:hover {
              background: lighten($button-background-color, 10%);
            }
          }
        }

        .json-schema-validator-editor {
          flex: 1;
          display: flex;
          min-height: 0;
          overflow: hidden;
          border: 1px solid #e5e5e5;

          :global(.jse-text-mode),
          :global(.jse-contents) {
            border: none;
          }

          --jse-panel-background: #f5f5f5;
          --jse-panel-border: 1px solid #e5e5e5;
        }
      }
    }

    .json-schema-validator-status {
      flex: 1;
      font-family: var(--jse-font-family);
      font-size: var(--jse-font-size);
      padding: $margin;

      &.json-schema-validator-status-ok {
        background: #9ac45d;
        color: #fff;
      }

      &.json-schema-validator-status-error {
        background: var(--jse-error-color);
        color: #fff;
      }

      &.json-schema-validator-status-warning {
        background: var(--jse-warning-color);
        color: var(--jse-text-color);
      }
    }
  }
</style>
