import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { UserPageView as Component } from '../'
import {
  UserFragment,
  MeDocument,
  MeQuery,
  UpdateCurrentUserDocument,
  UpdateCurrentUserMutation,
} from 'src/gql/generated'
import {
  RequestType,
  GraphQLRequestContext,
} from '.storybook/addons/msw/msw-adapter'

type Props = Parameters<typeof Component>[0]

const mockViewedUser: UserFragment = {
  __typename: 'User',
  id: 'user-1',
  username: 'johndoe',
  fullname: 'John Doe',
  createdAt: new Date('2024-01-01'),
  image: null,
  content: 'Hello, I am John Doe!',
}

const mockCurrentUser: UserFragment = {
  __typename: 'User',
  id: 'current-user-id',
  username: 'currentuser',
  fullname: 'Current User',
  createdAt: new Date('2024-01-01'),
  image: null,
  content: 'I am the current user.',
}

const meta = {
  title: 'pages/Users/User/View',
  component: Component,
  argTypes: {},
} satisfies Meta<Props>

export default meta

type Story = StoryObj<Props>

export const NotAuthenticated: Story = {
  args: {
    user: mockViewedUser,
  },
  parameters: {
    appContext: {
      user: null,
    },
    msw: {
      mocks: [
        {
          type: RequestType.GRAPHQL,
          query: MeDocument,
          response: (): { data: MeQuery } => ({
            data: { me: null },
          }),
        },
      ],
    },
  },
}

export const AuthenticatedOtherUser: Story = {
  args: {
    user: mockViewedUser,
  },
  parameters: {
    appContext: {
      user: mockCurrentUser,
    },
    msw: {
      mocks: [
        {
          type: RequestType.GRAPHQL,
          query: MeDocument,
          response: (): { data: MeQuery } => ({
            data: { me: mockCurrentUser },
          }),
        },
      ],
    },
  },
}

export const AuthenticatedOwnProfile: Story = {
  args: {
    user: mockCurrentUser,
  },
  parameters: {
    appContext: {
      user: mockCurrentUser,
    },
    msw: {
      mocks: [
        {
          type: RequestType.GRAPHQL,
          query: MeDocument,
          response: (): { data: MeQuery } => ({
            data: { me: mockCurrentUser },
          }),
        },
        {
          type: RequestType.GRAPHQL,
          query: UpdateCurrentUserDocument,
          response: (
            req: GraphQLRequestContext,
          ): { data: UpdateCurrentUserMutation } => {
            return {
              data: {
                response: {
                  ...mockCurrentUser,
                  ...req.variables?.data,
                },
              },
            }
          },
        },
      ],
    },
  },
}
