"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  addCategoryAction,
  addHighlightAction,
  deleteCategoryAction,
  deleteHighlightAction,
  deleteProductAction,
  logoutAction,
  moveHighlightAction,
  saveHeroAction,
  saveProductAction,
  saveSettingsAction,
} from "@/app/admin/actions";
import { ImageField } from "@/components/image-field";
import { MediaImage } from "@/components/media-image";
import { DEPARTMENTS, departmentLabel, type Department, type Gender, type Hero, type Product, type StorefrontPayload } from "@/lib/types";

type Tab = "store" | "heroes" | "highlights" | "categories" | "products";

export function Studio({ data }: { data: StorefrontPayload }) {
  const [tab, setTab] = useState<Tab>("store");
  return (
    <div className="min-h-screen overflow-x-clip bg-[#f6f6f6]">
      <header className="flex items-center justify-between bg-ink px-5 py-4 text-white">
        <div>
          <p className="text-xs uppercase tracking-wide text-white/70">Nike Nairobi</p>
          <h1 className="text-xl font-medium">Studio</h1>
        </div>
        <form action={logoutAction}>
          <button type="submit" className="text-sm underline underline-offset-4">Sign out</button>
        </form>
      </header>
      <div className="flex gap-2 overflow-x-auto px-4 py-3">
        {(
          [
            ["store", "Store"],
            ["heroes", "Heroes"],
            ["highlights", "Highlights"],
            ["categories", "Categories"],
            ["products", "Products"],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" onClick={() => setTab(id)} className={`rounded-full px-4 py-2 text-sm ${tab === id ? "bg-ink text-white" : "bg-white"}`}>
            {label}
          </button>
        ))}
      </div>
      <div className="mx-auto min-w-0 max-w-3xl px-4 pb-16 [&_form]:min-w-0 [&_input]:max-w-full [&_input]:min-w-0 [&_select]:max-w-full [&_textarea]:max-w-full">
        {tab === "store" ? <StoreForm data={data} /> : null}
        {tab === "heroes" ? <HeroForms heroes={data.heroes} /> : null}
        {tab === "highlights" ? <Highlights data={data} /> : null}
        {tab === "categories" ? <Categories data={data} /> : null}
        {tab === "products" ? <Products data={data} /> : null}
      </div>
    </div>
  );
}

function savedNote(result: { error?: string }) {
  return result.error ?? "Saved";
}

function Notice({ message }: { message: string | null }) {
  if (!message) return null;
  return <p className="mt-3 text-sm text-sale">{message}</p>;
}

function StoreForm({ data }: { data: StorefrontPayload }) {
  const router = useRouter();
  const [form, setForm] = useState({
    companyName: data.settings.companyName,
    logo: data.settings.logo,
    announcement: data.settings.announcement,
    pickupAddress: data.settings.pickupAddress,
    deliveryFeeKes: String(data.settings.deliveryFeeCents / 100),
    freeDeliveryThresholdKes: String(data.settings.freeDeliveryThresholdCents / 100),
  });
  const [message, setMessage] = useState<string | null>(null);
  return (
    <form
      className="space-y-3 min-w-0 overflow-hidden rounded-2xl bg-white p-4 sm:p-5"
      onSubmit={async (event) => {
        event.preventDefault();
        const result = await saveSettingsAction({
          ...form,
          deliveryFeeKes: Number(form.deliveryFeeKes),
          freeDeliveryThresholdKes: Number(form.freeDeliveryThresholdKes),
        });
        setMessage(savedNote(result));
        router.refresh();
      }}
    >
      <h2 className="text-lg font-medium">Store</h2>
      <label className="block text-sm">Company name<input className="mt-1 w-full rounded-lg border border-line px-3 py-2" value={form.companyName} onChange={(event) => setForm({ ...form, companyName: event.target.value })} /></label>
      <ImageField label="Logo" value={form.logo} onChange={(logo) => setForm({ ...form, logo })} />
      <label className="block text-md">Announcement<span className="mt-1 block text-xs font-normal text-muted">One announcement per line. They take turns in the bar.</span><textarea className="mt-1 w-full rounded-lg border border-line px-3 py-2" rows={4} value={form.announcement} onChange={(event) => setForm({ ...form, announcement: event.target.value })} /></label>
      <label className="block text-sm">Pickup address<textarea className="mt-1 w-full rounded-lg border border-line px-3 py-2" rows={2} value={form.pickupAddress} onChange={(event) => setForm({ ...form, pickupAddress: event.target.value })} /></label>
      <label className="block text-sm">Delivery fee (KES)<input className="mt-1 w-full rounded-lg border border-line px-3 py-2" value={form.deliveryFeeKes} onChange={(event) => setForm({ ...form, deliveryFeeKes: event.target.value })} /></label>
      <label className="block text-sm">Free delivery from (KES)<input className="mt-1 w-full rounded-lg border border-line px-3 py-2" value={form.freeDeliveryThresholdKes} onChange={(event) => setForm({ ...form, freeDeliveryThresholdKes: event.target.value })} /></label>
      <button className="rounded-full bg-ink px-5 py-2 text-sm text-white" type="submit">Save store</button>
      <Notice message={message} />
    </form>
  );
}

function HeroForms({ heroes }: { heroes: Hero[] }) {
  return (
    <div className="space-y-4">
      {heroes.map((hero) => (
        <HeroForm key={hero.id} hero={hero} />
      ))}
    </div>
  );
}

function HeroForm({ hero }: { hero: Hero }) {
  const router = useRouter();
  const [form, setForm] = useState(hero);
  const [message, setMessage] = useState<string | null>(null);
  const title = hero.slot === "hero3" ? `Hero 3 · ${hero.department ? departmentLabel(hero.department) : ""}` : hero.slot === "hero1" ? "Hero 1" : "Hero 2";
  return (
    <form
      className="space-y-3 min-w-0 overflow-hidden rounded-2xl bg-white p-4 sm:p-5"
      onSubmit={async (event) => {
        event.preventDefault();
        const result = await saveHeroAction({
          id: form.id,
          eyebrow: form.eyebrow,
          headline: form.headline,
          image: form.image,
          buttonLabel: form.buttonLabel,
        });
        setMessage(savedNote(result));
        router.refresh();
      }}
    >
      <h2 className="text-lg font-medium">{title}</h2>
      <label className="block text-sm">Eyebrow<input className="mt-1 w-full rounded-lg border border-line px-3 py-2" value={form.eyebrow} onChange={(event) => setForm({ ...form, eyebrow: event.target.value })} /></label>
      <label className="block text-sm">Headline<textarea className="mt-1 w-full rounded-lg border border-line px-3 py-2" rows={2} value={form.headline} onChange={(event) => setForm({ ...form, headline: event.target.value })} /></label>
      <label className="block text-sm">Button<input className="mt-1 w-full rounded-lg border border-line px-3 py-2" value={form.buttonLabel} onChange={(event) => setForm({ ...form, buttonLabel: event.target.value })} /></label>
      <ImageField label="Background image" value={form.image} onChange={(image) => setForm({ ...form, image })} />
      <button className="rounded-full bg-ink px-5 py-2 text-sm text-white" type="submit">Save hero</button>
      <Notice message={message} />
    </form>
  );
}

function Highlights({ data }: { data: StorefrontPayload }) {
  const router = useRouter();
  const [image, setImage] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const items = [...data.highlights].sort((a, b) => a.sort - b.sort);
  return (
    <div className="space-y-4 min-w-0 overflow-hidden rounded-2xl bg-white p-4 sm:p-5">
      <h2 className="text-lg font-medium">Highlight strip</h2>
      {items.map((item, index) => (
        <div key={item.id} className="flex items-center gap-3 border-t border-line py-3">
          <MediaImage src={item.image} alt="" className="h-20 w-16 object-cover" />
          <div className="flex flex-col gap-2">
            <button
              type="button"
              className="text-sm underline"
              disabled={index === 0}
              onClick={async () => {
                const ids = items.map((entry) => entry.id);
                const swapped = [...ids];
                [swapped[index - 1], swapped[index]] = [swapped[index], swapped[index - 1]];
                await moveHighlightAction(swapped);
                router.refresh();
              }}
            >
              Up
            </button>
            <button
              type="button"
              className="text-sm underline"
              onClick={async () => {
                await deleteHighlightAction(item.id);
                router.refresh();
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
      <ImageField label="New highlight" value={image} onChange={setImage} />
      <button
        type="button"
        className="rounded-full bg-ink px-5 py-2 text-sm text-white"
        onClick={async () => {
          const result = await addHighlightAction(image);
          setMessage(result.error ?? "Added");
          if ("ok" in result) setImage("");
          router.refresh();
        }}
      >
        Add highlight
      </button>
      <Notice message={message} />
    </div>
  );
}

function Categories({ data }: { data: StorefrontPayload }) {
  const router = useRouter();
  const [department, setDepartment] = useState<Department>("new");
  const [name, setName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl bg-white p-4 sm:p-5">
      <h2 className="text-lg font-medium">Categories</h2>
      {DEPARTMENTS.map((entry) => (
        <div key={entry} className="mt-4">
          <h3 className="font-medium">{departmentLabel(entry)}</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {data.categories
              .filter((category) => category.department === entry)
              .map((category) => (
                <li key={category.id} className="flex items-center justify-between border-b border-line py-2">
                  {category.name}
                  <button
                    type="button"
                    className="underline"
                    onClick={async () => {
                      await deleteCategoryAction(category.id);
                      router.refresh();
                    }}
                  >
                    Delete
                  </button>
                </li>
              ))}
          </ul>
        </div>
      ))}
      <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <select className="rounded-lg border border-line px-3 py-2" value={department} onChange={(event) => setDepartment(event.target.value as Department)}>
          {DEPARTMENTS.map((entry) => (
            <option key={entry} value={entry}>{departmentLabel(entry)}</option>
          ))}
        </select>
        <input className="rounded-lg border border-line px-3 py-2" value={name} onChange={(event) => setName(event.target.value)} placeholder="Category name" />
        <button
          type="button"
          className="rounded-full bg-ink px-4 py-2 text-sm text-white"
          onClick={async () => {
            const result = await addCategoryAction({ name, department });
            setMessage(result.error ?? "Added");
            if ("ok" in result) setName("");
            router.refresh();
          }}
        >
          Add
        </button>
      </div>
      <Notice message={message} />
    </div>
  );
}

function blankProduct(): ProductDraft {
  return {
    name: "",
    subtitle: "",
    description: "",
    deliveryReturns: "Nairobi delivery takes 2 to 5 days. Unworn items can be returned in store within 30 days.",
    priceKes: "",
    compareAtKes: "",
    badge: "",
    gender: "unisex",
    kids: false,
    active: true,
    departments: [{ department: "new", category: "Shoes" }],
    colors: [{ name: "Black", hex: "#111111" }],
    sizes: [{ label: "M", inStock: true }],
    images: [{ image: "", alt: "", colorName: "Black" }],
  };
}

type ProductDraft = {
  id?: string;
  name: string;
  subtitle: string;
  description: string;
  deliveryReturns: string;
  priceKes: string;
  compareAtKes: string;
  badge: string;
  gender: Gender;
  kids: boolean;
  active: boolean;
  departments: { department: Department; category: string }[];
  colors: { name: string; hex: string }[];
  sizes: { label: string; inStock: boolean }[];
  images: { image: string; alt: string; colorName: string }[];
};

function fromProduct(product: Product): ProductDraft {
  return {
    id: product.id,
    name: product.name,
    subtitle: product.subtitle,
    description: product.description,
    deliveryReturns: product.deliveryReturns,
    priceKes: String(product.priceCents / 100),
    compareAtKes: product.compareAtPriceCents ? String(product.compareAtPriceCents / 100) : "",
    badge: product.badge ?? "",
    gender: product.gender,
    kids: product.kids,
    active: product.active,
    departments: product.departments,
    colors: product.colors.map((color) => ({ name: color.name, hex: color.hex })),
    sizes: product.sizes.map((size) => ({ label: size.label, inStock: size.inStock })),
    images: product.images.map((image) => ({
      image: image.image,
      alt: image.alt,
      colorName: product.colors.find((color) => color.id === image.colorId)?.name ?? "",
    })),
  };
}

function Products({ data }: { data: StorefrontPayload }) {
  const router = useRouter();
  const [editing, setEditing] = useState<ProductDraft | null>(null);
  if (editing) return <ProductForm initial={editing} onDone={() => setEditing(null)} />;
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Products</h2>
        <button type="button" className="rounded-full bg-ink px-4 py-2 text-sm text-white" onClick={() => setEditing(blankProduct())}>
          New product
        </button>
      </div>
      <ul className="mt-4 divide-y divide-line">
        {data.products.map((product) => (
          <li key={product.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
            <div className="min-w-0">
              <p className="break-words font-medium">{product.name}</p>
              <p className="text-muted">{product.active ? "Visible" : "Hidden"} · KES {product.priceCents / 100}</p>
            </div>
            <div className="flex shrink-0 gap-3">
              <button type="button" className="underline" onClick={() => setEditing(fromProduct(product))}>Edit</button>
              <button
                type="button"
                className="underline"
                onClick={async () => {
                  if (!window.confirm(`Delete ${product.name}?`)) return;
                  await deleteProductAction(product.id);
                  router.refresh();
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProductForm({ initial, onDone }: { initial: ProductDraft; onDone: () => void }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [message, setMessage] = useState<string | null>(null);

  function patchList<T>(key: "departments" | "colors" | "sizes" | "images", index: number, patch: Partial<T>) {
    setForm((current) => {
      const list = [...current[key]] as T[];
      list[index] = { ...list[index], ...patch };
      return { ...current, [key]: list };
    });
  }

  return (
    <form
      className="space-y-3 min-w-0 overflow-hidden rounded-2xl bg-white p-4 sm:p-5"
      onSubmit={async (event) => {
        event.preventDefault();
        const result = await saveProductAction({
          id: form.id,
          name: form.name,
          subtitle: form.subtitle,
          description: form.description,
          deliveryReturns: form.deliveryReturns,
          priceKes: Number(form.priceKes),
          compareAtKes: form.compareAtKes.trim() ? Number(form.compareAtKes) : null,
          badge: form.badge.trim() ? form.badge.trim() : null,
          gender: form.gender,
          kids: form.kids,
          active: form.active,
          departments: form.departments,
          colors: form.colors,
          sizes: form.sizes,
          images: form.images.map((image) => ({ ...image, colorName: image.colorName || null })),
        });
        setMessage(savedNote(result));
        if ("ok" in result) {
          router.refresh();
          onDone();
        }
      }}
    >
      <button type="button" className="text-sm underline" onClick={onDone}>Back to products</button>
      <h2 className="text-lg font-medium">{form.id ? "Edit product" : "New product"}</h2>
      <label className="block text-sm">Name<input className="mt-1 w-full rounded-lg border border-line px-3 py-2" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
      <label className="block text-sm">Subtitle<input className="mt-1 w-full rounded-lg border border-line px-3 py-2" value={form.subtitle} onChange={(event) => setForm({ ...form, subtitle: event.target.value })} /></label>
      <label className="block text-sm">Price in KES<input className="mt-1 w-full rounded-lg border border-line px-3 py-2" value={form.priceKes} onChange={(event) => setForm({ ...form, priceKes: event.target.value })} /></label>
      <label className="block text-sm">Compare-at price in KES<input className="mt-1 w-full rounded-lg border border-line px-3 py-2" value={form.compareAtKes} onChange={(event) => setForm({ ...form, compareAtKes: event.target.value })} /></label>
      <label className="block text-sm">Badge<input className="mt-1 w-full rounded-lg border border-line px-3 py-2" value={form.badge} onChange={(event) => setForm({ ...form, badge: event.target.value })} /></label>
      <label className="block text-sm">Gender
        <select className="mt-1 w-full rounded-lg border border-line px-3 py-2" value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value as Gender })}>
          <option value="men">Men</option>
          <option value="women">Women</option>
          <option value="unisex">Unisex</option>
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.kids} onChange={(event) => setForm({ ...form, kids: event.target.checked })} /> Kids product</label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} /> Visible on the storefront</label>
      <label className="block text-sm">Description<textarea className="mt-1 w-full rounded-lg border border-line px-3 py-2" rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
      <label className="block text-sm">Delivery and returns<textarea className="mt-1 w-full rounded-lg border border-line px-3 py-2" rows={3} value={form.deliveryReturns} onChange={(event) => setForm({ ...form, deliveryReturns: event.target.value })} /></label>

      <div>
        <p className="text-sm font-medium">Departments</p>
        {form.departments.map((entry, index) => (
          <div key={`${entry.department}-${index}`} className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
            <select className="rounded-lg border border-line px-2 py-2 text-sm" value={entry.department} onChange={(event) => patchList("departments", index, { department: event.target.value as Department })}>
              {DEPARTMENTS.map((department) => <option key={department} value={department}>{departmentLabel(department)}</option>)}
            </select>
            <input className="rounded-lg border border-line px-2 py-2 text-sm" value={entry.category} onChange={(event) => patchList("departments", index, { category: event.target.value })} />
            <button type="button" className="text-sm underline" onClick={() => setForm({ ...form, departments: form.departments.filter((_, item) => item !== index) })}>Remove</button>
          </div>
        ))}
        <button type="button" className="mt-2 text-sm underline" onClick={() => setForm({ ...form, departments: [...form.departments, { department: "men", category: "Shoes" }] })}>Add department</button>
      </div>

      <div>
        <p className="text-sm font-medium">Colours</p>
        {form.colors.map((color, index) => (
          <div key={`${color.name}-${index}`} className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_8rem_auto]">
            <input className="rounded-lg border border-line px-2 py-2 text-sm" value={color.name} onChange={(event) => patchList("colors", index, { name: event.target.value })} />
            <input className="rounded-lg border border-line px-2 py-2 text-sm" value={color.hex} onChange={(event) => patchList("colors", index, { hex: event.target.value })} />
            <button type="button" className="text-sm underline" onClick={() => setForm({ ...form, colors: form.colors.filter((_, item) => item !== index) })}>Remove</button>
          </div>
        ))}
        <button type="button" className="mt-2 text-sm underline" onClick={() => setForm({ ...form, colors: [...form.colors, { name: "", hex: "#111111" }] })}>Add colour</button>
      </div>

      <div>
        <p className="text-sm font-medium">Sizes</p>
        {form.sizes.map((size, index) => (
          <div key={`${size.label}-${index}`} className="mt-2 flex flex-wrap items-center gap-2">
            <input className="flex-1 rounded-lg border border-line px-2 py-2 text-sm" value={size.label} onChange={(event) => patchList("sizes", index, { label: event.target.value })} />
            <label className="text-sm"><input type="checkbox" checked={size.inStock} onChange={(event) => patchList("sizes", index, { inStock: event.target.checked })} /> In stock</label>
            <button type="button" className="text-sm underline" onClick={() => setForm({ ...form, sizes: form.sizes.filter((_, item) => item !== index) })}>Remove</button>
          </div>
        ))}
        <button type="button" className="mt-2 text-sm underline" onClick={() => setForm({ ...form, sizes: [...form.sizes, { label: "", inStock: true }] })}>Add size</button>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium">Images</p>
        {form.images.map((image, index) => (
          <div key={`image-${index}`} className="rounded-xl border border-line p-3">
            <ImageField label="Image link or upload" value={image.image} onChange={(value) => patchList("images", index, { image: value })} />
            <input className="mt-2 w-full rounded-lg border border-line px-2 py-2 text-sm" placeholder="Alt text" value={image.alt} onChange={(event) => patchList("images", index, { alt: event.target.value })} />
            <input className="mt-2 w-full rounded-lg border border-line px-2 py-2 text-sm" placeholder="Colour name this image belongs to" value={image.colorName} onChange={(event) => patchList("images", index, { colorName: event.target.value })} />
            <button type="button" className="mt-2 text-sm underline" onClick={() => setForm({ ...form, images: form.images.filter((_, item) => item !== index) })}>Remove image</button>
          </div>
        ))}
        <button type="button" className="text-sm underline" onClick={() => setForm({ ...form, images: [...form.images, { image: "", alt: "", colorName: "" }] })}>Add image</button>
      </div>

      <div className="flex gap-3">
        <button className="rounded-full bg-ink px-5 py-2 text-sm text-white" type="submit">Save product</button>
        {form.id ? (
          <button
            type="button"
            className="text-sm underline"
            onClick={async () => {
              if (!form.id) return;
              if (!window.confirm("Delete this product?")) return;
              await deleteProductAction(form.id);
              router.refresh();
              onDone();
            }}
          >
            Delete product
          </button>
        ) : null}
      </div>
      <Notice message={message} />
    </form>
  );
}
