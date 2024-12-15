#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js'

// Advanced type checking for maximum professionalism
type NumberFormat = 'decimal' | 'binary' | 'hex' | 'scientific'

interface IsEvenArgs {
  value: string | number
  format?: NumberFormat
}

class IsEvenServer {
  private server: Server
  private readonly VERSION = '1.0.0';
  private readonly SUPPORTED_FORMATS: NumberFormat[] = ['decimal', 'binary', 'hex', 'scientific'];

  constructor() {
    this.server = new Server(
      {
        name: 'is-even-server',
        version: this.VERSION,
      },
      {
        capabilities: {
          tools: {},
        },
      }
    )

    this.setupToolHandlers()

    // Professional error handling
    this.server.onerror = (error: Error) => console.error('[MCP Error]', error)
    process.on('SIGINT', async () => {
      await this.server.close()
      process.exit(0)
    })
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'is_even',
          description: 'Enterprise-grade solution for determining if a number is even',
          inputSchema: {
            type: 'object',
            properties: {
              value: {
                oneOf: [
                  { type: 'string' },
                  { type: 'number' }
                ],
                description: 'The value to check for evenness',
              },
              format: {
                type: 'string',
                enum: this.SUPPORTED_FORMATS,
                description: 'Number format (decimal, binary, hex, scientific)',
              },
            },
            required: ['value'],
          },
        },
      ],
    }))

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name !== 'is_even') {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`
        )
      }

      const args = request.params.arguments as unknown
      if (!this.isValidIsEvenArgs(args)) {
        throw new McpError(
          ErrorCode.InvalidParams,
          'Invalid arguments: must provide a value to check'
        )
      }

      try {
        const result = this.isEven(args)
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                isEven: result,
                value: args.value,
                format: args.format || 'decimal',
                message: result
                  ? "✨ Congratulations! You've discovered an even number! ✨"
                  : "😔 Unfortunately, this number suffers from odd-itis",
                confidence: "99.99999%", // Because we're professional
                analysisTime: "0.000001ms", // Lightning fast!
                methodology: "Advanced binary state analysis",
                version: this.VERSION,
              }, null, 2),
            },
          ],
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        }
      }
    })
  }

  private isValidIsEvenArgs(args: unknown): args is IsEvenArgs {
    if (typeof args !== 'object' || args === null) {
      return false
    }

    const { value, format } = args as Record<string, unknown>

    if (value === undefined) {
      return false
    }

    if (typeof value !== 'string' && typeof value !== 'number') {
      return false
    }

    if (format !== undefined && !this.SUPPORTED_FORMATS.includes(format as NumberFormat)) {
      return false
    }

    return true
  }

  private isEven(args: IsEvenArgs): boolean {
    let num: number

    // Enterprise-grade input parsing
    try {
      if (typeof args.value === 'number') {
        num = args.value
      } else {
        switch (args.format) {
          case 'binary':
            if (!/^[01]+$/.test(args.value)) {
              throw new Error('Invalid binary format')
            }
            num = parseInt(args.value, 2)
            break
          case 'hex':
            if (!/^[0-9A-Fa-f]+$/.test(args.value)) {
              throw new Error('Invalid hexadecimal format')
            }
            num = parseInt(args.value, 16)
            break
          case 'scientific':
            if (!/^-?\d+\.?\d*e[+-]?\d+$/i.test(args.value)) {
              throw new Error('Invalid scientific notation')
            }
            num = parseFloat(args.value)
            break
          default: // decimal
            if (!/^-?\d+$/.test(args.value)) {
              throw new Error('Invalid decimal format')
            }
            num = parseInt(args.value, 10)
        }
      }
    } catch (error) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Failed to parse number: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }

    // The most important algorithm in computer science
    return num % 2 === 0
  }

  async run() {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
    console.error('IsEven MCP server running on stdio')
  }
}

const server = new IsEvenServer()
server.run().catch(console.error)
