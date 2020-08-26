import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLList,
} from 'graphql';

const subscriptionData = [
  { id: 1, name: 'Weekly CSA Delivery', price: 100, accountId: 'myAccount' },
  { id: 2, name: 'Weekly CSA Add-on: Apples', price: 10, accountId: 'myAccount' },
];

const accountData = {
  id: 'myAccount',
  name: 'Example Account',
  subscriptions: subscriptionData,
}

const SubscriptionType = new GraphQLObjectType({
  name: 'Subscription',
  fields: {
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    price: { type: GraphQLString },
  },
});

const AccountType = new GraphQLObjectType({
  name: 'Account',
  fields: {
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    subscriptions: {
      type: new GraphQLList(SubscriptionType),
      resolve: () => subscriptionData,
    },
  },
});

const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    account: {
      type: AccountType,
      resolve: () => accountData,
    },
    subscriptions: {
      type: new GraphQLList(SubscriptionType),
      resolve: () => subscriptionData,
    }
  },
});

const MutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addSubscription: {
      type: SubscriptionType,
      args: {
        name: { type: GraphQLString },
        price: { type: GraphQLString }
      },
      resolve: function (_, { name, price }) {
        const subscription = {
          id: subscriptionData[subscriptionData.length - 1].id + 1,
          name,
          price
        };

        subscriptionData.push(subscription);
        return subscription
      }
    },
  },
});

export const schema = new GraphQLSchema({ query: QueryType, mutation: MutationType });
