import { faker } from '@faker-js/faker'

/**
 * Generate fake user data for testing
 */
export const userFixtures = {
  validUser: () => ({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: '11999999999', // Valid Brazilian phone (11 digits)
    role: 'CUSTOMER'
  }),

  adminUser: () => ({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: '11988888888',
    role: 'ADMIN'
  }),

  managerUser: () => ({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: '11977777777',
    role: 'MANAGER'
  }),

  userWithoutEmail: () => ({
    name: faker.person.fullName(),
    phone: '11966666666',
    role: 'CUSTOMER'
  })
}

/**
 * Generate fake business manager data for testing
 */
export const businessManagerFixtures = {
  validBusinessManager: () => ({
    metaBusinessId: faker.string.numeric(15),
    name: faker.company.name(),
    accessToken: faker.string.alphanumeric(200),
    verificationStatus: 'verified',
    isActive: true
  }),

  businessManagerWithFlowKeys: () => ({
    metaBusinessId: faker.string.numeric(15),
    name: faker.company.name(),
    accessToken: faker.string.alphanumeric(200),
    flowPrivateKey: faker.string.alphanumeric(500),
    flowCertificate: faker.string.alphanumeric(500),
    flowCertificateExpiresAt: faker.date.future(),
    isActive: true
  })
}

/**
 * Generate fake WhatsApp Business Account data for testing
 */
export const wabaFixtures = {
  validWABA: (businessManagerId: string) => ({
    businessManagerId,
    metaWabaId: faker.string.numeric(15),
    name: faker.company.name(),
    currency: 'BRL',
    timezone: 'America/Sao_Paulo',
    messageTemplateNamespace: faker.string.alphanumeric(20),
    accountReviewStatus: 'APPROVED'
  })
}

/**
 * Generate fake WhatsApp Phone Number data for testing
 */
export const phoneNumberFixtures = {
  validPhoneNumber: (wabaId: string) => ({
    wabaId,
    metaPhoneNumberId: faker.string.numeric(15),
    phoneNumber: `+5511${faker.string.numeric(9)}`,
    verifiedName: faker.company.name(),
    displayPhoneNumber: `+55 11 ${faker.string.numeric(9)}`,
    qualityRating: 'GREEN',
    isOfficialBusinessAccount: true,
    platformType: 'CLOUD_API'
  })
}
