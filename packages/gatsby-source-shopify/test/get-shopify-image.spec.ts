import { getShopifyImage } from "../src/get-shopify-image";

const image = {
  originalSrc:
    "https://cdn.shopify.com/s/files/1/0854/5382/products/front-hero.jpg?v=1460125603",
  width: 2048,
  height: 1535,
};

describe("the getShopifyImage helper", () => {
  it("generates an imagedata object", () => {
    const data = getShopifyImage({ image, layout: "fullWidth" });
    expect(data?.images?.fallback?.srcSet).toMatchInlineSnapshot(`
      "https://cdn.shopify.com/s/files/1/0854/5382/products/front-hero_320x240_crop_center.jpg?v=1460125603 320w,
      https://cdn.shopify.com/s/files/1/0854/5382/products/front-hero_654x490_crop_center.jpg?v=1460125603 654w,
      https://cdn.shopify.com/s/files/1/0854/5382/products/front-hero_768x576_crop_center.jpg?v=1460125603 768w,
      https://cdn.shopify.com/s/files/1/0854/5382/products/front-hero_1024x768_crop_center.jpg?v=1460125603 1024w,
      https://cdn.shopify.com/s/files/1/0854/5382/products/front-hero_1366x1024_crop_center.jpg?v=1460125603 1366w,
      https://cdn.shopify.com/s/files/1/0854/5382/products/front-hero_1600x1199_crop_center.jpg?v=1460125603 1600w,
      https://cdn.shopify.com/s/files/1/0854/5382/products/front-hero_1920x1439_crop_center.jpg?v=1460125603 1920w,
      https://cdn.shopify.com/s/files/1/0854/5382/products/front-hero_2048x1535_crop_center.jpg?v=1460125603 2048w"
    `);
  });
});
