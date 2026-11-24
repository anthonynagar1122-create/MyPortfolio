import { notFound, redirect } from "next/navigation";
import { products } from "@/config/products";

type ProductSlug = (typeof products)[keyof typeof products]["slug"];

const productsById = Object.values(products).reduce<Record<string, { slug: ProductSlug }>>((index, product) => {
  index[product.id] = { slug: product.slug };
  return index;
}, {});

export function generateStaticParams() {
  return Object.keys(productsById).map((id) => ({ id }));
}

export default async function LegacyProductRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = productsById[id];
  if (!product) notFound();
  redirect(`/apps/${product.slug}`);
}
