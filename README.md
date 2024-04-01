# Next Image Processing

<img src="/public/testimage.jpg?raw=true" height="100"/>


Blazing fast image processing/transformations and CDN running on Vercel edge functions using Rust and WebAssembly.

Image processing powered by [Photon](https://github.com/silvia-odwyer/photon)⚡

## Features
- ⚡ Blazing fast image processing
- ☁️ Fully serverless, runs on Vercel Edge functions
- 🏞️ Resize, crop, compress, tint, rotate, format and more
- 🌏 Global distribution with Edge functions
- 💾 Automated CDN cache with Edge functions
- 🔁 Replacement for `next/image` processing on Vercel
- 🔗 Local and remote image processing
- 🧩 Fully managed API coming soon to [JigsawStack](https://jigsawstack.com)


## Usage
The image processing API can be hosted on your own Vercel project which would also work on Cloudflare Pages/Workers, as long there is support for Edge functions. This API is on the Next.js, hosted on Vercel.

## API

**Base path:** `/api/image`

All image processing is done by sending a `GET` request to the API with the following query parameters

Zod object schema for the query parameters:
```ts
z.object({
  url: z.string(),
  format: z.enum(["webp", "jpeg", "png"]).optional(),
  jpeg_quality: z.string().transform((v) => parseInt(v)).pipe(z.number().min(1).max(100)).optional(),
  width: z
    .string().transform((v) => parseInt(v)).pipe(z.number().min(1)).optional(),
  height: z.string().transform((v) => parseInt(v)).pipe(z.number().min(1)).optional(),
  fit: z.enum(["contain", "cover", "fill"]).optional(),
  fit_cover_letterbox_color: z.string().optional(),
  fliph: z.string().transform((v) => v && v.toLowerCase() === "true").optional(),
  flipv: z
    .string().transform((v) => v && v.toLowerCase() === "true").optional(),
  padding: z.string().optional(),
  padding_color: z.string().optional(),
  rotate: z.string().transform((v) => parseInt(v)).optional(),
  crop: z.string().optional(),
  blur: z.enum(["gaussian", "box"]).optional(),
  blur_radius: z.string().transform((v) => parseInt(v)).optional(),
  sharpen: z.string().transform((v) => v && v.toLowerCase() === "true").optional(),
  noise_reduction: z.string().transform((v) => v && v.toLowerCase() === "true").optional(),
  brightness: z.string().transform((v) => parseInt(v)).optional(),
  hue: z.string().transform((v) => parseInt(v)).optional(),
  saturation: z.string().transform((v) => parseInt(v)).optional(),
  tint: z.string().optional(),
  grayscale: z.string().transform((v) => parseInt(v)).optional(),
});
```

### Helpers
You can use the `transformImage` helper function in `src/client` to form the query parameters and URL.

Example usage with client image:
```tsx
<img
    src={transformImage({
        url: "/testimage.jpg",
        width: 500,
        format: "webp",
        fit: "contain",
    })}
/>
```

### Remote vs Local images:
- For remote images, you can pass the full URL to the `url` param. `https://example.com/image.jpg`
- For local images, you can pass the relative path to the `url` param. The API will fetch the image from the same domain. `/image.jpg`

### Caching
Caching is handled by the Edge function which utilizes Vercel's CDN based on the cache control headers set in the API which is currently set to 30 days. You can learn more [here](https://vercel.com/docs/edge-network/caching) about the requirements and configurations and adjust the caching accordingly.

```js
return new NextResponse(outputBuffer, {
    status: 200,
    headers: {
        "cache-control": "public, s-maxage=2592000",
    },
});
```


## Usage in your own project
1. Install [@cf-wasm/photon](https://github.com/fineshopdesign/cf-wasm/tree/main/packages/photon)
2. Copy the API layer from `pages/api/image` or use it as a reference to write your own layer.


## Running Locally
```bash
1. Clone the repository
2. Install dependencies: `yarn`
3. Start the development server: `yarn dev`
4. Make requests to the API: http://localhost:3000/api/image?url=/image.jpg&width=500&format=webp
````

## Credits
- @silvia-odwyer - https://github.com/silvia-odwyer/photon?tab=readme-ov-file for doing most of the hard work by creating Photon, the image processing library.
- @fineshopdesign - https://github.com/fineshopdesign/cf-wasm/tree/main/packages/photon for making it work on NextJS


