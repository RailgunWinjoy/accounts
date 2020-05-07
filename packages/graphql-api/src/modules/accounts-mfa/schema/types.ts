import gql from 'graphql-tag';

export default gql`
  type Authenticator {
    id: ID
    type: String
    active: Boolean
    activatedAt: String
  }

  type DefaultChallengeResult {
    mfaToken: String
    authenticatorId: String
  }

  union ChallengeResult = DefaultChallengeResult
`;
