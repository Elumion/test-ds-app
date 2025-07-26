import type { LoaderFunctionArgs } from "@remix-run/node";
import shopify from "app/shopify.server";
import { json } from "@remix-run/node";
import * as XLSX from "xlsx";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const requestUrl = new URL(request.url);
  const shop = requestUrl.searchParams.get("shop");
  const ordersIds = requestUrl.searchParams.get("ordersIds");
  if (!shop) {
    return json({ error: "Shop not provided" }, { status: 400 });
  }
  if (!ordersIds) {
    return json({ error: "Ids of orders not provided" }, { status: 400 });
  }
  const admin = await shopify.unauthenticated.admin(shop);

  const response = await admin.admin.graphql(
    `query GetOrders($queryID: String) {
  orders(first: 250, query: $queryID) {
    nodes {
      lineItems(first: 250) {
        nodes {
          variant {
            displayName
          }
          id
          quantity
          name
          sku
          discountedUnitPriceSet {
            presentmentMoney {
              amount
              currencyCode
            }
          }
        }
      }
      id
      name
      createdAt
      fullyPaid
      shippingAddress {
        address1
      }
    }
  }
}`,
    {
      variables: {
        queryID: `[${ordersIds}]`,
      },
    },
  );
  const responseJson = await response.json();

  const orders = responseJson.data?.orders?.nodes.reduce((acc, order) => {
    const newOrder = order.lineItems.nodes.map((lineItem) => ({
      "Order ID": order.id,
      "Order name": order.name,
      "Product Name": lineItem.variant.displayName,
      "Date created": order.createdAt,
      "Fully paid": order.fullyPaid,
      "Shipping Address": order.shippingAddress?.address1,
      sku: lineItem.sku,
      quantity: lineItem.quantity,
      price: `${lineItem.discountedUnitPriceSet.presentmentMoney.amount} ${lineItem.discountedUnitPriceSet.presentmentMoney.currencyCode}`,
    }));
    return acc.concat(newOrder);
  }, []);

  // 4. Generate Excel workbook
  const worksheet = XLSX.utils.json_to_sheet(orders);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  // 5. Return Excel response
  return new Response(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="orders_export.xlsx"',
    },
  });
};
