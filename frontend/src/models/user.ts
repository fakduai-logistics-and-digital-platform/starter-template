export interface UserLoginRequestBody {
  email: string
  password: string
}

export interface UserLoggedInData {
  email: string
  token: string
}

export interface UserGetRequestParam {
  // For original API
  page?: number
  pageSize?: number
  filterBy?: string
  filterValue?: string
  // For DummyJSON API
  limit?: number
  skip?: number
}

// DummyJSON API Response Types
export interface Hair {
  color: string
  type: string
}

export interface Coordinates {
  lat: number
  lng: number
}

export interface Address {
  address: string
  city: string
  state: string
  stateCode: string
  postalCode: string
  coordinates: Coordinates
  country: string
}

export interface Bank {
  cardExpire: string
  cardNumber: string
  cardType: string
  currency: string
  iban: string
}

export interface Company {
  department: string
  name: string
  title: string
  address: Address
}

export interface Crypto {
  coin: string
  wallet: string
  network: string
}

export interface User {
  id: number
  firstName: string
  lastName: string
  maidenName: string
  age: number
  gender: 'male' | 'female'
  email: string
  phone: string
  username: string
  password: string
  birthDate: string
  image: string
  bloodGroup: string
  height: number
  weight: number
  eyeColor: string
  hair: Hair
  ip: string
  address: Address
  macAddress: string
  university: string
  bank: Bank
  company: Company
  ein: string
  ssn: string
  userAgent: string
  crypto: Crypto
  role: 'admin' | 'moderator' | 'user'
}

export interface UserGetResponseData {
  users: User[]
  total: number
  skip: number
  limit: number
}

// Keep old interfaces for backward compatibility if needed
export interface UserGetResponseDataItem {
  ID: string
  Username: string
  Email: string
  RoleID: string
  Roles: UserGetResponseDataRoleItem
}

export interface UserGetResponseDataRoleItem {
  ID: string
  Name: string
  Description: string
}
