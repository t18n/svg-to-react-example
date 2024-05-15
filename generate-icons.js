const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { transform } = require('@svgr/core');

const ICON_ROOT_DIR = 'src';
const ICONS_SOURCE_DIR = ICON_ROOT_DIR + '/svg';
const COMPONENTS_DIR = ICON_ROOT_DIR + '/components';

/**
 * Do not override existing files, so we can customize each icon.
 */
const ignoreExisting = false;

const icons = glob.sync(`${ICONS_SOURCE_DIR}/**/**.svg`);

// Custom template for generating components
const componentTemplate = ({ imports, interfaces, componentName, props, jsx, exports }, { tpl }) => {
  return tpl`
${imports};
${'\n'}
${interfaces};
${'\n'}

export function ${componentName}(props: SVGProps<SVGSVGElement>) {
  return (
    ${jsx}
  );
};

${componentName}.displayName = '${componentName}';
`;
};

// Generate components
(async function() {
  for await (const icon of icons) {
    const svg = fs.readFileSync(icon, 'utf8');
    const parentDir = path.parse(icon).dir.split('/').pop();
    const iconCategory = parentDir === 'svg' ? '' : toCamelCase(parentDir);
    const componentName = 'Icon' + iconCategory + toCamelCase(path.parse(icon).name);

    // INFO: This determines if we should transform the color of the SVG
    // If the SVG has a data-color attribute, we should transform the color so we can set the icon color via CSS
    // this mostly applies to icons that are monochrome
    // Otherwise, we should not transform the color as many icons are already colored
    const isMonochromeIcon = /data-color="monochrome"/.test(svg);

    const svgGoTransformColorsPlugins = isMonochromeIcon ? [
      {
        name: 'convertColors',
        params: {
          currentColor: true,
        },
      },
    ] : [];

    const componentCode = await transform(
      svg,
      {
        plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx', '@svgr/plugin-prettier'],
        template: componentTemplate,
        icon: true,
        dimensions: true,
        typescript: true,
        prettier: true,
        prettierConfig: {
          parser: 'typescript',
        },
        svgProps: {
          role: 'img',
        },
        ignoreExisting,
        svgo: true,
        svgoConfig: {
          plugins: [
            {
              name: 'preset-default',
              params: {
                overrides: {
                  removeViewBox: false,
                },
              },
            },
            'convertStyleToAttrs',
            ...svgGoTransformColorsPlugins
          ],
        },
      },
      { componentName },
    );

    const componentRelativePath = `${COMPONENTS_DIR}/${componentName}.tsx`;
    const barrelFileRelativePath = `${COMPONENTS_DIR}/index.tsx`;

    function writeComponent(isOverride) {
      fs.writeFileSync(componentRelativePath, componentCode);

      // Only write to barrel file if it's not an override
      if (!isOverride) {
        fs.appendFileSync(barrelFileRelativePath, "export * from './" + componentName + "';\n");
        return;
      }
    }

    fs.access(componentRelativePath, fs.constants.F_OK, err => {
      // No error means file exist
      if (!err) {
        // If ignoreExisting is true and file exist, skip
        if (!ignoreExisting) {
          console.warn(`⚠️ Override ${componentName} due to ignoreExisting: ${ignoreExisting}`);
          writeComponent(true);
          return;
        }

        console.warn(`Skipping ${componentName} due to ignoreExisting: ${ignoreExisting}`);
        return;
      }

      // If file doesn't exist, write it
      console.info(`✅ Generated ${componentName}.`);
      writeComponent();
    });
  }
})();

function capitalizeFirstLetter(text) {
  if (!text || typeof text !== 'string') return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function toCamelCase(text) {
  const titleCaseParts = text.split(/[_-]/).map(type => capitalizeFirstLetter(type));
  return titleCaseParts.join('');
}
