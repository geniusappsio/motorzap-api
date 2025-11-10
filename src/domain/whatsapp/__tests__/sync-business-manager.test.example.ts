/**
 * Exemplo de teste para validar a sincronização de Business Manager
 *
 * Para executar:
 * bun test src/domain/whatsapp/__tests__/sync-business-manager.test.example.ts
 */

import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import { eq } from 'drizzle-orm'

import { db } from '@/infrastructure/database/drizzle/connection'
import { businessManager } from '@/infrastructure/database/drizzle/schema/business-managers'
import { whatsappBusinessAccount } from '@/infrastructure/database/drizzle/schema/whatsapp-business-accounts'
import { whatsappPhoneNumber } from '@/infrastructure/database/drizzle/schema/whatsapp-phone-numbers'

import { SyncBusinessManagerUseCase } from '../use-cases/sync-business-manager.use-case'

describe('Business Manager Sync', () => {
  let testBusinessManagerId: string
  const TEST_TOKEN = process.env.TEST_META_TOKEN || 'YOUR_TEST_TOKEN_HERE'

  beforeAll(async () => {
    // Criar Business Manager de teste apenas com token
    const [bm] = await db
      .insert(businessManager)
      .values({
        accessToken: TEST_TOKEN,
        isActive: true
      })
      .returning()

    testBusinessManagerId = bm.id
    console.log('Created test Business Manager:', testBusinessManagerId)
  })

  afterAll(async () => {
    // Limpar dados de teste
    if (testBusinessManagerId) {
      await db.delete(businessManager).where(eq(businessManager.id, testBusinessManagerId))
      console.log('Cleaned up test Business Manager')
    }
  })

  test('deve criar Business Manager apenas com token', async () => {
    const [bm] = await db
      .select()
      .from(businessManager)
      .where(eq(businessManager.id, testBusinessManagerId))
      .limit(1)

    expect(bm).toBeDefined()
    expect(bm.accessToken).toBe(TEST_TOKEN)
    expect(bm.metaBusinessId).toBeNull() // Ainda não sincronizado
    expect(bm.name).toBeNull() // Ainda não sincronizado
  })

  test('deve sincronizar Business Manager e preencher campos automaticamente', async () => {
    const syncUseCase = new SyncBusinessManagerUseCase()

    const result = await syncUseCase.execute({
      businessManagerId: testBusinessManagerId
    })

    expect(result.success).toBe(true)
    expect(result.result.metaBusinessId).toBeDefined()
    expect(result.result.wabasCount).toBeGreaterThan(0)

    // Verificar se foi atualizado no banco
    const [bm] = await db
      .select()
      .from(businessManager)
      .where(eq(businessManager.id, testBusinessManagerId))
      .limit(1)

    expect(bm.metaBusinessId).not.toBeNull() // Agora deve estar preenchido
    expect(bm.name).not.toBeNull() // Agora deve estar preenchido
    expect(bm.lastSyncedAt).not.toBeNull() // Deve ter timestamp de sync
  })

  test('deve criar WABAs automaticamente', async () => {
    const wabas = await db
      .select()
      .from(whatsappBusinessAccount)
      .where(eq(whatsappBusinessAccount.businessManagerId, testBusinessManagerId))

    expect(wabas.length).toBeGreaterThan(0)
    expect(wabas[0].metaWabaId).toBeDefined()
    expect(wabas[0].name).toBeDefined()
    expect(wabas[0].currency).toBeDefined()
  })

  test('deve criar Phone Numbers automaticamente', async () => {
    // Buscar primeiro WABA
    const [waba] = await db
      .select()
      .from(whatsappBusinessAccount)
      .where(eq(whatsappBusinessAccount.businessManagerId, testBusinessManagerId))
      .limit(1)

    expect(waba).toBeDefined()

    // Buscar phone numbers desse WABA
    const phoneNumbers = await db
      .select()
      .from(whatsappPhoneNumber)
      .where(eq(whatsappPhoneNumber.wabaId, waba.id))

    expect(phoneNumbers.length).toBeGreaterThan(0)
    expect(phoneNumbers[0].metaPhoneNumberId).toBeDefined()
    expect(phoneNumbers[0].phoneNumber).toBeDefined()
    expect(phoneNumbers[0].displayPhoneNumber).toBeDefined()
  })

  test('deve fazer UPDATE em vez de INSERT na segunda sincronização', async () => {
    const syncUseCase = new SyncBusinessManagerUseCase()

    // Primeira sincronização
    await syncUseCase.execute({
      businessManagerId: testBusinessManagerId
    })

    // Contar WABAs após primeira sync
    const wabasAfterFirstSync = await db
      .select()
      .from(whatsappBusinessAccount)
      .where(eq(whatsappBusinessAccount.businessManagerId, testBusinessManagerId))

    const firstSyncCount = wabasAfterFirstSync.length

    // Segunda sincronização
    await syncUseCase.execute({
      businessManagerId: testBusinessManagerId
    })

    // Contar WABAs após segunda sync
    const wabasAfterSecondSync = await db
      .select()
      .from(whatsappBusinessAccount)
      .where(eq(whatsappBusinessAccount.businessManagerId, testBusinessManagerId))

    const secondSyncCount = wabasAfterSecondSync.length

    // Deve ter a mesma quantidade (não duplicou)
    expect(secondSyncCount).toBe(firstSyncCount)
  })
})

/**
 * Teste manual (não automatizado)
 *
 * Execute este arquivo diretamente:
 * bun run src/domain/whatsapp/__tests__/sync-business-manager.test.example.ts
 */
if (import.meta.main) {
  console.log('🧪 Executando teste manual de sincronização...\n')

  // Substitua pelo ID do seu Business Manager
  const BUSINESS_MANAGER_ID = process.argv[2] || 'your-business-manager-id'

  const syncUseCase = new SyncBusinessManagerUseCase()

  const result = await syncUseCase.execute({
    businessManagerId: BUSINESS_MANAGER_ID
  })

  console.log('\n📊 Resultado da sincronização:')
  console.log(JSON.stringify(result, null, 2))

  if (result.success) {
    console.log('\n✅ Sincronização concluída com sucesso!')
  } else {
    console.log('\n❌ Sincronização falhou:')
    console.log(result.result.errors)
  }
}
