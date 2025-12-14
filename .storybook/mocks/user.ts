import { MeQuery } from 'src/gql/generated'

export const mockUser: MeQuery['me'] = {
  __typename: 'User',
  id: 'mock-user-id',
  createdAt: new Date('2024-01-01'),
  username: 'john_doe',
  fullname: 'John Doe',
  image: null,
  content: null,
}

export const mockAdminUser: MeQuery['me'] = {
  ...mockUser,
  id: 'mock-admin-id',
  username: 'admin',
  fullname: 'Admin User',
}
