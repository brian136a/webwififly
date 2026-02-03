# Required Assets

Please add the following assets to the `/public` directory:

1. **logo.png** - Main logo image for the header (recommended size: 96x96px or larger)
   - Currently using placeholder `logo.svg` until logo.png is provided
   - The code will need to be updated to use .png format when the asset is available
2. **home-bg.jpg** - Full-screen background image for the home page (recommended size: 1920x1080px or larger)

These assets will be referenced in:
- Header: `/logo.png` (currently `/logo.svg` as placeholder)
- Home page: `/home-bg.jpg` (currently using CSS gradient as placeholder)

## Migration Steps

When adding the actual assets:

1. Add `logo.png` to `/public/logo.png`
2. Update `/src/components/layout/Header.tsx` line 13: change `src="/logo.svg"` to `src="/logo.png"`
3. Add `home-bg.jpg` to `/public/home-bg.jpg`
4. Update `/src/app/page.tsx` to uncomment the Image component for the background
