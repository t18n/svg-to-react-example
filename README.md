# Example to generate React component from SVG
## Getting started

Clone/fork the repo, add your icons to the `src/svg` folder, playaround with the script and options to match your need. Then copy the code to your project :)

The option `ignoreExisting: true` is set so that we do not override already-generated icon components, so we can customize each icon to support any needs without worrying being overriden.

## Using an Icon type

Example of using an icon type:

```tsx
interface ButtonProps {
  icon: IconType;
}

// ...
const IconComponent = icon ? Icons[icon] : null;

return (
  <button>
    {IconComponent && <IconComponent />}
  </button>
);
```

## Replacing color
For SVGs with monochrome color styles, I replaced the color with `currentColor`, which allow us to set color through a prop instead of drilling to `svg path` in CSS.

For example:
```ts
<IconDCIcons8GreenLanternDcFilled color="blue" />
```

However, for more complex icons with multiple colors, this won't be ideal. So I only make this behavior on "monochrome" icons. To specify that the icon should receive "color" as a prop, in the raw `.svg` file, you need to add `data-color="monochrome"`. Change this attribute to anything you like, but remember to update the script too.

> INFO: Note that you need the raw SVG file with the color props preserved to work. A "flatten" SVG file will not work with this approach. See `IconDCIcons8GreenLanternDcFilled` (work) and `IconDCIcons8GreenLanternDcFilledFlatten` (not work) example.

## Attributions
Great thanks to [Icon8](https://icons8.com/icons) for the icons. I've used their platform for 4 years and highly recommended it.
