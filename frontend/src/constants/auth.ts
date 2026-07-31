export const ROLE_ACCESS = {
  admin: ['dashboard', 'patients', 'appointments', 'doctors', 'billing', 'clinical', 'staff', 'reports', 'laboratory', 'pharmacy', 'prescriptions', 'beds'],
  doctor: ['dashboard', 'patients', 'appointments', 'clinical', 'reports', 'laboratory', 'prescriptions', 'beds'],
  receptionist: ['dashboard', 'patients', 'appointments', 'beds'],
  accountant: ['dashboard', 'billing', 'reports'],
}

export const ROLES = ['admin', 'doctor', 'receptionist', 'accountant']

export const FIREBASE_ERROR_MESSAGES = {
  'auth/invalid-credential': 'Invalid email or password',
  'auth/wrong-password': 'Invalid email or password',
  'auth/user-not-found': 'No account found with this email',
  'auth/invalid-email': 'Please enter a valid email address',
  'auth/too-many-requests': 'Too many attempts — try again later',
  'auth/popup-closed-by-user': 'Sign-in cancelled',
  'auth/network-request-failed': 'Network error — check your connection',
  'auth/email-already-in-use': 'An account with this email already exists',
  'auth/weak-password': 'Password must be at least 6 characters',
}
