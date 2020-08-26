# Apollo Client Issue Reproduction

<!--
  Thanks for filing an issue on Apollo Client!

  Please make sure that you include the following information to ensure that your issue is actionable.

  If you don't follow the template, your issue may end up being closed without anyone looking at it carefully, because it is not actionable for us without the information in this template.

  **PLEASE NOTE:** Feature requests and non-bug related discussions are no longer managed in this repo. Feature requests should be opened in https://github.com/apollographql/apollo-feature-requests.
-->

**Intended outcome:**
<!--
What you were trying to accomplish when the bug occurred, and as much code as possible related to the source of the problem.
-->
I work at a SaaS company. We have a web app. Our data model includes `accounts` which have `subscriptions` to `products`. There I was, building a form for updating an account's subscriptions, and my Apollo Client started behaving in an unexpected way. Reloading the page no longer updated the code for my newest changes. The data coming into the front end didn't match what was coming out of the database. So strange!

I had defined Types on the backend:

```
 class Types::SubscriptionType < Types::BaseObject
  implements GraphQL::Relay::Node.interface
  use_adapter Adapters::SubscriptionTypeObjectAdapter
  global_id_field :id
  field :account, Types::AccountType, null: false
  field :product, Types::ProductType, null: false
  field :quantity, Integer, null: false
  field :display_name, String, null: false
  field :price, Float, null: false
end
```

```
class Types::AccountType < Types::BaseObject
  use_adapter Adapters::AccountTypeObjectAdapter

  global_id_field :id
  field :subscriptions, [Types::SubscriptionType], null: true
end
```

I had a query on the front end:
```
const MY_SUBSCRIPTION_QUERY = gql`
  query AccountSubscriptionsQuery($accountId: Int!) {
    accountById(accountId: $accountId) {
      id
      subscriptions {
        id
        displayName
        expirationDate
        quantity
        product {
          id
          price
          name
       }
    }
  }
}
`
```

I used the Apollo client's `useQuery` to query the backend for the data.

```
import { useQuery, gql } from '@apollo/client';
import SubscriptionForm from './SubscriptionForm';

const SubscriptionFormDataFetcher = () => {
  const { data, loading, error } = useQuery(MY_SUBSCRIPTION_QUERY, {
    variables: { accountId: 'accountId' },
  });
  if (loading) {
    return 'loading...';
  }
  const account = data.accountById;
  return (
    <SubscriptionForm account={account} />
  );
}
```

The query should have returned an account with an array of `subscription` objects. The correct JSON blob got to the browser in the network tab:
```
data: {
  accountById: {
    id: 'accountId',
    subscriptions: [
      { id: 'firstSubscriptionId' },
      { id: 'secondSubscriptionId' }
    ]
  }
}
```

But the data returned from `useQuery` contained multiple copies of the first `subscription` object in the array. When I pasted my query into graphiql, it returned the correct data, but something inside of Apollo Client was transforming the `account.subscriptions` array from `[subscription1, subscription2]` to [subscription1, subscription1]`.


```
data: {
  accountById: {
    id: 'accountId',
    subscriptions: [
      { id: 'firstSubscriptionId' },
      **{ id: 'firstSubscriptionId' }**
    ]
  }
}
```
**Actual outcome:**
It took me a day or two to figure out that the problem was the word "Subscriptions" itself. Apollo Client uses `subscription` as a reserved word. But there was no error message, no warning, no explanation from the software itself to tell me that I couldn't define a `SubscriptionType`.

Surely I'm not the only developer working on a Software-as-a-Service platform that uses `subscriptions` as part of our business logic and data model. It's a hole that I stepped in, and I'm sure it's affected other developers as well. For now, my GraphQL schema is calling them `subskriptions` but I think it would be swell if the software itself could return a helpful error message or warning when someone defines a `SubscriptionType`.

**How to reproduce the issue:**
<!--
If possible, please create a reproduction using https://github.com/apollographql/react-apollo-error-template and link to it here. If you prefer an in-browser way to create reproduction, try: https://codesandbox.io/s/github/apollographql/react-apollo-error-template

Instructions for how the issue can be reproduced by a maintainer or contributor. Be as specific as possible, and only mention what is necessary to reproduce the bug. If possible, try to isolate the exact circumstances in which the bug occurs and avoid speculation over what the cause might be.
-->
Create a type named `SubscriptionType` and try to query for it.

**Versions**
<!--
Run the following command in your project directory, and paste its (automatically copied to clipboard) results here:

`npx envinfo@latest --preset apollo --clipboard`
-->
npx: installed 1 in 1.779s

  System:
    OS: macOS 10.15.6
  Binaries:
    Node: 10.16.0 - ~/.asdf/installs/nodejs/10.16.0/bin/node
    Yarn: 1.21.1 - /usr/local/bin/yarn
    npm: 6.9.0 - ~/.asdf/installs/nodejs/10.16.0/bin/npm
  Browsers:
    Chrome: 84.0.4147.135
    Firefox: 77.0.1
    Safari: 13.1.2
  npmPackages:
    @apollo/client: ^3.0.2 => 3.1.3
# Reproduction Creation Steps

1. Clone the repository
2. Install all dependencies with `npm install`.
3. Start the development server with `npm start`.
4. Notice that the list of "subscriptions" is just a list of the same 1 subscription repeated.
5. Imagine you are a developer who is trying to build a web app that sells subscriptions. Think of what kind of error message you would like to see in this situation.
