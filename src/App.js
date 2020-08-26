import React, { useState } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";

const ACCOUNT_SUBSCRIPTIONS = gql`
  query AccountSubscriptions {
    account {
      id
      name
      subscriptions {
        id
        name
        price
      }
    }
  }
`;

const ADD_SUBSCRIPTION = gql`
  mutation AddSubscription($name: String, $price: String) {
    addSubscription(name: $name, price: $price) {
      id
      name
      price
    }
  }
`;

export default function App() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('0');

  const {
    loading,
    data,
  } = useQuery(ACCOUNT_SUBSCRIPTIONS);

  const [addSubscription] = useMutation(ADD_SUBSCRIPTION, {
    update: (cache, { data: { addSubscription: addSubscriptionData } }) => {
      const accountSubscriptionsResult = cache.readQuery({ query: ACCOUNT_SUBSCRIPTIONS });

      cache.writeQuery({
        query: ACCOUNT_SUBSCRIPTIONS,
        data: {
          ...accountSubscriptionsResult,
          subscriptions: [
            ...accountSubscriptionsResult.subscriptions,
            addSubscriptionData,
          ],
        },
      });
    },
  });

  return (
    <main>
      <h1>Apollo Client Issue Reproduction</h1>
      <p>
        When you have a business object called a Subscription, Apollo Client doesn't return your data, but also doesn't return an error or warning message
      </p>
      <div className="add-subscription">
        <label htmlFor="name">Name</label>
        <input
          type="text"
          name="name"
          value={name}
          onChange={evt => setName(evt.target.value)}
        />
        <label htmlFor="name">Price</label>
        <input
          type="text"
          name="price"
          pattern="[0-9.]+"
          value={price}
          onChange={evt => setPrice(evt.target.value)}
        />
        <button
          onClick={() => {
            addSubscription({ variables: { name, price } });
            setName('');
            setPrice('0');
          }}
        >
          Add subscription
        </button>
      </div>
      <h2>Subscriptions</h2>
      {loading ? (
        <p>Loading…</p>
      ) : (
        <ul>
          {data?.account.subscriptions.map(subscription => (
            <li key={subscription.id}>{subscription.name}: {subscription.price}</li>
          ))}
        </ul>
      )}
    </main>
  );
}
