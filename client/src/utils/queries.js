import { gql } from '@apollo/client';

export const GET_ME = gql`
  query getSingleUser {
    getSingleUser {
      _id
      username
      email
      savedBooks
    }
  }
`;