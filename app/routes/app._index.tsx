import { useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const requestUrl = new URL(request.url);

  const basicUrl = requestUrl.origin.startsWith("https")
    ? requestUrl.origin
    : `https` + requestUrl.origin.substring(4);
  return {
    url: `${basicUrl}/files/getOrders`,
  };
};

export default function Index() {
  const { url } = useLoaderData<typeof loader>();

  return (
    <Page>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <BlockStack gap="200">
                  <Text as="span" variant="bodyMd">
                    include this link into app block customizer App Hosted Link
                    field:
                  </Text>
                  <Text as="strong" variant="heading2xl">
                    {url}
                  </Text>
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
