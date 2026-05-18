import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import * as path from 'path'
import * as fs from 'fs'

// Load .env.local for testing by parsing it manually
function loadEnvFile(filePath: string): void {
  if (!fs.existsSync(filePath)) return
  
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  
  for (const line of lines) {
    const trimmed = line.trim()
    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('#')) continue
    
    const eqIndex = trimmed.indexOf('=')
    if (eqIndex === -1) continue
    
    const key = trimmed.substring(0, eqIndex).trim()
    const value = trimmed.substring(eqIndex + 1).trim()
    
    // Remove surrounding quotes if present
    const cleanValue = value.replace(/^["']|["']$/g, '')
    process.env[key] = cleanValue
  }
}

// Load .env.local
loadEnvFile(path.resolve(process.cwd(), '.env.local'))

/**
 * Property 1: Bug Condition - Service Role Key JWT Role Claim
 * Validates: Requirements 1.1, 1.2, 2.2
 * 
 * This test verifies that the SUPABASE_SERVICE_ROLE_KEY environment variable
 * contains a JWT with the correct "service_role" role claim.
 * 
 * On UNFIXED code: This test MUST FAIL because the current key has "role": "anon"
 * On FIXED code: This test will PASS when the correct service role key is set
 */

/**
 * Decodes a JWT token and returns the payload
 */
function decodeJWT(token: string): { role: string } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = parts[1]
    // JWT uses base64url encoding, need to handle padding
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4)
    const decoded = Buffer.from(padded, 'base64').toString('utf-8')
    
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

/**
 * Property: The SUPABASE_SERVICE_ROLE_KEY JWT payload SHALL contain "role": "service_role"
 * 
 * This encodes the expected behavior - the service role key must have the service_role
 * role to bypass RLS policies in server-side Supabase operations.
 */
function hasServiceRoleClaim(token: string): boolean {
  const payload = decodeJWT(token)
  return payload?.role === 'service_role'
}

describe('Property 1: Bug Condition - Service Role Key JWT Role Claim', () => {
  it('SUPABASE_SERVICE_ROLE_KEY should contain "role": "service_role"', () => {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    expect(serviceKey).toBeDefined()
    
    // This will FAIL on unfixed code because the current key has "role": "anon"
    // This will PASS on fixed code when the correct service role key is set
    expect(hasServiceRoleClaim(serviceKey!)).toBe(true)
  })

  it('property-based: service role key must have service_role claim for all valid tokens', () => {
    // This property test verifies the logic works correctly
    // We test with known JWT patterns to ensure the decoder works
    
    // Test with a mock token that has service_role
    const mockServiceRoleToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiYnFzdXhzcWh0Zm53dGd0a2ZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODg0MzY5MH0.mock'
    
    // Test with a mock token that has anon
    const mockAnonToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiYnFzdXhzcWh0Zm53dGd0a2ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4NDM2OTB9.mock'
    
    // Verify the decoder correctly identifies service_role
    expect(hasServiceRoleClaim(mockServiceRoleToken)).toBe(true)
    
    // Verify the decoder correctly identifies anon (should be false for service role check)
    expect(hasServiceRoleClaim(mockAnonToken)).toBe(false)
  })

  it('property-based: decodeJWT correctly extracts role from various JWT formats', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant('service_role'),
          fc.constant('anon'),
          fc.constant('authenticated')
        ),
        (role) => {
          // Create a mock JWT with the given role
          const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
          const payload = Buffer.from(JSON.stringify({ 
            iss: 'supabase', 
            ref: 'test',
            role: role,
            iat: 1768843690
          })).toString('base64url')
          const mockToken = `${header}.${payload}.mock_signature`
          
          const decoded = decodeJWT(mockToken)
          expect(decoded).not.toBeNull()
          expect(decoded?.role).toBe(role)
        }
      ),
      { numRuns: 10 }
    )
  })
})