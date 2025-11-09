#!/usr/bin/env node
/**
 * CTV Portal Scripts CLI
 * Main entry point for all utility scripts
 * 
 * Usage: npx tsx scripts/index.ts <command> [options]
 */

const commands = {
    // User Management
    'user:create': {
        description: 'Create or update test user',
        file: './user/create-test-user.ts',
        example: 'npx tsx scripts/index.ts user:create'
    },
    'user:deals': {
        description: 'Update all users with random deals',
        file: './user/update-user-deals.ts',
        example: 'npx tsx scripts/index.ts user:deals'
    },
    'user:set-deals': {
        description: 'Set deals for specific user',
        file: './user/set-user-deals.ts',
        example: 'npx tsx scripts/index.ts user:set-deals 0912345678 25'
    },

    // Testing
    'test:db': {
        description: 'Test database connection',
        file: './test/test-api-direct.ts',
        example: 'npx tsx scripts/index.ts test:db'
    },
    'test:password': {
        description: 'Test password validation',
        file: './test/test-password-validation.ts',
        example: 'npx tsx scripts/index.ts test:password'
    },
    'test:form': {
        description: 'Test form validation',
        file: './test/test-form-validation.ts',
        example: 'npx tsx scripts/index.ts test:form'
    },

    // Diagnostics
    'diagnose': {
        description: 'Run full system diagnostics',
        file: './utils/diagnose-issue.ts',
        example: 'npx tsx scripts/index.ts diagnose'
    },

    // Help
    'help': {
        description: 'Show this help message',
        file: null,
        example: 'npx tsx scripts/index.ts help'
    }
}

function showHelp() {
    console.log('\n📦 CTV Portal Scripts CLI\n')
    console.log('Usage: npx tsx scripts/index.ts <command> [options]\n')
    console.log('Available Commands:\n')

    Object.entries(commands).forEach(([cmd, info]) => {
        console.log(`  ${cmd.padEnd(20)} ${info.description}`)
        console.log(`  ${' '.repeat(20)} Example: ${info.example}\n`)
    })
}

async function main() {
    const args = process.argv.slice(2)
    const command = args[0]

    if (!command || command === 'help') {
        showHelp()
        return
    }

    const cmd = commands[command as keyof typeof commands]

    if (!cmd) {
        console.error(`❌ Unknown command: ${command}`)
        console.log('\nRun "npx tsx scripts/index.ts help" to see available commands')
        process.exit(1)
    }

    if (cmd.file) {
        console.log(`\n🚀 Running: ${command}\n`)
        const module = await import(cmd.file)
        // Pass remaining arguments to the script
        process.argv = ['node', cmd.file, ...args.slice(1)]
    }
}

main().catch(console.error)
