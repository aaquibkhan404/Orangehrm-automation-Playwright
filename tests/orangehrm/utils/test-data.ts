export const TestData = {
  // Admin credentials
  adminCredentials: {
    username: 'Admin',
    password: 'admin123'
  },
  
  // Employee data
  employee: {
    name: 'Tristan L',
    otherEmployee: 'Odis Adalwin' // Example of another available employee
  },
  
  // User creation data
  user: {
    essUser: {
      userRole: 'ESS',
      status: 'Enabled',
      username: 'testuser' + Math.floor(Math.random() * 10000),
      password: 'Test@1234'
    },
    adminUser: {
      userRole: 'Admin',
      status: 'Enabled',
      username: 'testadmin' + Math.floor(Math.random() * 10000),
      password: 'Admin@1234'
    }
  },
  
  // User edit data
  editedUser: {
    promoteToAdmin: {
      userRole: 'Admin',
      status: 'Disabled',
      username: 'editeduser' + Math.floor(Math.random() * 10000)
    },
    demoteToESS: {
      userRole: 'ESS',
      status: 'Enabled',
      username: 'demoteduser' + Math.floor(Math.random() * 10000)
    }
  },
  
  // Status options
  statusOptions: {
    enabled: 'Enabled',
    disabled: 'Disabled'
  },
  
  // User roles
  userRoles: {
    admin: 'Admin',
    ess: 'ESS'
  },
  
  // Search test data
  searchTest: {
    validSearch: 'testuser',
    invalidSearch: 'nonexistentuser'
  },
  
  // Password requirements
  passwords: {
    valid: 'Valid@1234',
    tooShort: 'Short1',
    noNumber: 'NoNumber@',
    noUpperCase: 'lowercase1@',
    noSpecialChar: 'MissingSpecial1'
  }
};

// Helper function to generate random usernames
export function generateRandomUsername(prefix: string = 'user'): string {
  return prefix + Math.floor(Math.random() * 100000);
}