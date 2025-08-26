import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { OrdersStackParamList } from '../types';

// Placeholder components
const OrdersListScreen = () => <></>;
const OrderDetailsScreen = () => <></>;
const CreateOrderScreen = () => <></>;
const CheckoutFlowScreen = () => <></>;
const PaymentMethodScreen = () => <></>;
const OrderTrackingScreen = () => <></>;
const SalesHistoryScreen = () => <></>;
const OrderChatScreen = () => <></>;

const OrdersStack = createStackNavigator<OrdersStackParamList>();

const OrdersNavigator: React.FC = () => {
  return (
    <OrdersStack.Navigator>
      <OrdersStack.Screen name="OrdersList" component={OrdersListScreen} />
      <OrdersStack.Screen name="OrderDetails" component={OrderDetailsScreen} />
      <OrdersStack.Screen name="CreateOrder" component={CreateOrderScreen} />
      <OrdersStack.Screen name="CheckoutFlow" component={CheckoutFlowScreen} />
      <OrdersStack.Screen name="PaymentMethod" component={PaymentMethodScreen} />
      <OrdersStack.Screen name="OrderTracking" component={OrderTrackingScreen} />
      <OrdersStack.Screen name="SalesHistory" component={SalesHistoryScreen} />
      <OrdersStack.Screen name="OrderChat" component={OrderChatScreen} />
    </OrdersStack.Navigator>
  );
};

export default OrdersNavigator;